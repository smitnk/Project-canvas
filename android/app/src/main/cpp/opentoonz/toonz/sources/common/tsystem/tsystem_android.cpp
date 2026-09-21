#include "tsystem.h"

#include <cerrno>
#include <chrono>
#include <cstdio>
#include <cstring>
#include <dirent.h>
#include <filesystem>
#include <fstream>
#include <list>
#include <sys/stat.h>
#include <thread>
#include <unistd.h>

namespace TSystem {

const int MaxPathLen = 4096;
const int MaxFNameLen = 256;
const int MaxHostNameLen = 64;

static std::string nativePath(const TFilePath &p) {
  return p.getQString().toStdString();
}

bool doHaveMainLoop() { return true; }
void hasMainLoop(bool) {}

void readDirectory(TFilePathSet &out, const TFilePath &path,
                   bool groupFrames, bool onlyFiles, bool getHiddenFiles) {
  (void)groupFrames;
  std::error_code ec;
  std::filesystem::path root(nativePath(path));
  if (!std::filesystem::is_directory(root, ec)) return;

  for (const auto &entry : std::filesystem::directory_iterator(root, ec)) {
    if (ec) break;
    const std::string name = entry.path().filename().string();
    if (!getHiddenFiles && !name.empty() && name[0] == '.') continue;
    if (onlyFiles && !entry.is_regular_file(ec)) continue;
    out.push_back(TFilePath(entry.path().string()));
  }
}

void readDirectory(TFilePathSet &out, const TFilePathSet &paths,
                   bool groupFrames, bool onlyFiles, bool getHiddenFiles) {
  for (const auto &p : paths)
    readDirectory(out, p, groupFrames, onlyFiles, getHiddenFiles);
}

bool doesExistFileOrLevel(const TFilePath &fp) {
  std::error_code ec;
  return std::filesystem::exists(std::filesystem::path(nativePath(fp)), ec);
}

TFilePath getHomeDirectory() {
  const char *home = std::getenv("HOME");
  return TFilePath(home ? home : "/");
}

TFilePath getTempDir() {
  const char *tmp = std::getenv("TMPDIR");
  return TFilePath(tmp ? tmp : "/data/local/tmp");
}

TFilePath getTestDir(std::string name) {
  return getTempDir() + TFilePath(name);
}

void mkDir(const TFilePath &path) {
  std::error_code ec;
  std::filesystem::create_directories(std::filesystem::path(nativePath(path)), ec);
  if (ec) throw TSystemException(path, ec.message());
}

void rmDir(const TFilePath &path) {
  std::error_code ec;
  std::filesystem::remove(std::filesystem::path(nativePath(path)), ec);
  if (ec) throw TSystemException(path, ec.message());
}

void rmDirTree(const TFilePath &path) {
  std::error_code ec;
  std::filesystem::remove_all(std::filesystem::path(nativePath(path)), ec);
  if (ec) throw TSystemException(path, ec.message());
}

void deleteFile(const TFilePath &path) {
  std::error_code ec;
  std::filesystem::remove(std::filesystem::path(nativePath(path)), ec);
  if (ec && ec.value() != ENOENT) throw TSystemException(path, ec.message());
}

void renameFile(const TFilePath &dst, const TFilePath &src, bool overwrite) {
  std::error_code ec;
  if (overwrite) std::filesystem::remove(std::filesystem::path(nativePath(dst)), ec);
  ec.clear();
  std::filesystem::rename(std::filesystem::path(nativePath(src)),
                          std::filesystem::path(nativePath(dst)), ec);
  if (ec) throw TSystemException(dst, ec.message());
}

void copyFile(const TFilePath &dst, const TFilePath &src, bool overwrite) {
  std::error_code ec;
  auto opts = overwrite ? std::filesystem::copy_options::overwrite_existing
                        : std::filesystem::copy_options::none;
  if (!std::filesystem::copy_file(std::filesystem::path(nativePath(src)),
                                  std::filesystem::path(nativePath(dst)),
                                  opts, ec))
    throw TSystemException(dst, ec.message());
}

bool removeFileOrLevel(const TFilePath &fp) {
  deleteFile(fp);
  return true;
}

bool copyFileOrLevel(const TFilePath &dst, const TFilePath &src) {
  copyFile(dst, src, true);
  return true;
}

bool renameFileOrLevel(const TFilePath &dst, const TFilePath &src, bool overwrite) {
  renameFile(dst, src, overwrite);
  return true;
}

bool isUNC(const TFilePath &) { return false; }
TFilePath toUNC(const TFilePath &fp) { return fp; }
TFilePath toLocalPath(const TFilePath &fp) { return fp; }
bool showDocument(const TFilePath &) { return false; }
bool isDLLBlackListed(QString) { return false; }
void sleep(TINT64 delay) {
  std::this_thread::sleep_for(std::chrono::milliseconds(delay));
}

int getProcessorCount() {
  long n = sysconf(_SC_NPROCESSORS_ONLN);
  return n > 0 ? static_cast<int>(n) : 1;
}

long getCPUExtensions() { return CPUExtensionsNone; }

std::iostream openTemporaryFile() {
  return std::iostream(nullptr);
}

}  // namespace TSystem

TSystemException::TSystemException(const TFilePath &p, int err)
    : TException(std::strerror(err)), m_fname(p), m_err(err) {}

TSystemException::TSystemException(const TFilePath &p, const std::string &msg)
    : TException(msg), m_fname(p), m_err(0), m_msg(std::wstring(msg.begin(), msg.end())) {}

TSystemException::TSystemException(const TFilePath &p, const std::wstring &msg)
    : TException(msg), m_fname(p), m_err(0), m_msg(msg) {}

TSystemException::TSystemException(const std::string &msg)
    : TException(msg), m_err(0), m_msg(std::wstring(msg.begin(), msg.end())) {}

TSystemException::TSystemException(const std::wstring &msg)
    : TException(msg), m_err(0), m_msg(msg) {}

