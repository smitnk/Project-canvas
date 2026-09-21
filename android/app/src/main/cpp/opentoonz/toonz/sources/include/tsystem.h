#pragma once

#ifndef TSYSTEM_INCLUDED
#define TSYSTEM_INCLUDED

#ifndef _WIN32
#include <sys/stat.h>
#endif

#undef DVAPI
#undef DVVAR
#ifdef TSYSTEM_EXPORTS
#define DVAPI DV_EXPORT_API
#define DVVAR DV_EXPORT_VAR
#else
#define DVAPI DV_IMPORT_API
#define DVVAR DV_IMPORT_VAR
#endif

#include "tfilepath.h"

#ifndef TNZCORE_LIGHT

#include <QDateTime>
#include <QFile>
#include <QFileInfo>
#include <QDir>
#include <QObject>
#include <QStringList>

DVAPI std::ostream &operator<<(std::ostream &out, const QDateTime &t);

class DVAPI TFileStatus {
  bool m_exist;
  QFileInfo m_fileInfo;

public:
  TFileStatus(const TFilePath &path);
  QString getGroup() const;
  QString getUser() const;
  TINT64 getSize() const;
  QDateTime getLastAccessTime() const;
  QDateTime getLastModificationTime() const;
  QDateTime getCreationTime() const;
  bool isDirectory() const;
  bool isLink() const;
  QFile::Permissions getPermissions() const;

  bool doesExist() const { return m_exist; }
  bool isWritable() const { return (getPermissions() & QFile::WriteUser) != 0; }
  bool isReadable() const {
    return m_exist && (getPermissions() & QFile::ReadUser) != 0;
  }

  bool isWritableDir() const {
    return doesExist() && isDirectory() && isWritable();
  };
};

#endif

class DVAPI TSystemException final : public TException {
  TFilePath m_fname;
  int m_err;
  TString m_msg;

public:
  TSystemException() {}
  TSystemException(const TFilePath &, int);
  TSystemException(const TFilePath &, const std::string &);
  TSystemException(const TFilePath &, const std::wstring &);
  TSystemException(const std::string &);
  TSystemException(const std::wstring &msg);
  ~TSystemException() {}
  TString getMessage() const override;
};

namespace TSystem {
extern const int MaxPathLen;
extern const int MaxFNameLen;
extern const int MaxHostNameLen;

DVAPI bool doHaveMainLoop();
DVAPI void hasMainLoop(bool state);

DVAPI void readDirectory(TFilePathSet &fpset, const QDir &dir,
                         bool groupFrames = true);
DVAPI void readDirectory(TFilePathSet &fpset, const TFilePath &path,
                         bool groupFrames = true, bool onlyFiles = false,
                         bool getHiddenFiles = false);
DVAPI void readDirectory(TFilePathSet &fpset, const TFilePathSet &pathSet,
                         bool groupFrames = true, bool onlyFiles = false,
                         bool getHiddenFiles = false);
DVAPI void readDirectoryTree(TFilePathSet &fpset, const TFilePath &path,
                             bool groupFrames = true, bool onlyFiles = false);
DVAPI void readDirectoryTree(TFilePathSet &fpset, const TFilePathSet &pathSet,
                             bool groupFrames = true, bool onlyFiles = false);
DVAPI void readDirectory(TFilePathSet &groupFpSet, TFilePathSet &allFpSet,
                         const TFilePath &path);
DVAPI void readDirectory_Dir_ReadExe(TFilePathSet &dst, const TFilePath &path);
DVAPI void readDirectory_DirItems(QStringList &dst, const TFilePath &path);
DVAPI TFilePathSet readDirectory(const TFilePath &path, bool groupFrames = true,
                                 bool onlyFiles = false,
                                 bool getHiddenFiles = false);
DVAPI TFilePathSet readDirectory(const TFilePathSet &pathSet,
                                 bool groupFrames = true,
                                 bool onlyFiles = false,
                                 bool getHiddenFiles = false);
DVAPI TFilePathSet readDirectoryTree(const TFilePath &path,
                                     bool groupFrames = true,
                                     bool onlyFiles = false);
DVAPI TFilePathSet readDirectoryTree(const TFilePathSet &pathSet,
                                     bool groupFrames = true,
                                     bool onlyFiles = false);

DVAPI TFilePath getHomeDirectory();
DVAPI TFilePath getTempDir();
DVAPI TFilePath getTestDir(std::string name = "verify_tnzcore");
DVAPI TFilePath getBinDir();
DVAPI TFilePath getDllDir();
DVAPI int getProcessId();
DVAPI void mkDir(const TFilePath &path);
DVAPI void rmDir(const TFilePath &path);
DVAPI void rmDirTree(const TFilePath &path);
DVAPI void copyDir(const TFilePath &dst, const TFilePath &src);
DVAPI bool touchParentDir(const TFilePath &fp);
DVAPI void touchFile(const TFilePath &path);
DVAPI void copyFile(const TFilePath &dst, const TFilePath &src, bool overwrite = true);
DVAPI void renameFile(const TFilePath &dst, const TFilePath &src, bool overwrite = true);
DVAPI void deleteFile(const TFilePath &dst);
DVAPI void hideFile(const TFilePath &dst);
DVAPI void moveFileToRecycleBin(const TFilePath &fp);
DVAPI void copyFileOrLevel_throw(const TFilePath &dst, const TFilePath &src);
DVAPI bool renameImageSequence(const TFilePathSet &files,
                               const TFilePath &levelName, int prefixLength);
DVAPI void renameFileOrLevel_throw(const TFilePath &dst, const TFilePath &src,
                                   bool renamePalette = false);
DVAPI void removeFileOrLevel_throw(const TFilePath &fp);
DVAPI void hideFileOrLevel_throw(const TFilePath &fp);
DVAPI void moveFileOrLevelToRecycleBin_throw(const TFilePath &fp);
DVAPI bool doesExistFileOrLevel(const TFilePath &fp);
DVAPI bool copyFileOrLevel(const TFilePath &dst, const TFilePath &src);
DVAPI bool renameFileOrLevel(const TFilePath &dst, const TFilePath &src,
                             bool renamePalette = false);
DVAPI bool removeFileOrLevel(const TFilePath &fp);
DVAPI bool hideFileOrLevel(const TFilePath &fp);
DVAPI bool moveFileOrLevelToRecycleBin(const TFilePath &fp);
DVAPI void sleep(TINT64 delay);
inline void sleep(int ms) { sleep(static_cast<TINT64>(ms)); }
DVAPI TFilePathSet getDisks();
DVAPI TINT64 getDiskSize(const TFilePath &);
DVAPI TINT64 getFreeDiskSize(const TFilePath &);
DVAPI TINT64 getFreeMemorySize(bool onlyPhysicalMemory);
DVAPI TINT64 getMemorySize(bool onlyPhysicalMemory);
DVAPI bool memoryShortage();
DVAPI int getProcessorCount();
enum CPUExtensions {
  CPUExtensionsNone = 0x00000000L,
  CpuSupportsSse = 0x00000010L,
  CpuSupportsSse2 = 0x00000020L
};
DVAPI long getCPUExtensions();
DVAPI std::iostream openTemporaryFile();
void DVAPI outputDebug(std::string s);
DVAPI bool isUNC(const TFilePath &fp);
DVAPI TFilePath toUNC(const TFilePath &fp);
DVAPI TFilePath toLocalPath(const TFilePath &fp);
DVAPI bool showDocument(const TFilePath &fp);
#ifndef TNZCORE_LIGHT
DVAPI QDateTime getFileTime(const TFilePath &path);
DVAPI QString getHostName();
DVAPI QString getUserName();
DVAPI QString getSystemValue(const TFilePath &name);
DVAPI TFilePath getUniqueFile(QString field = "");
#endif
DVAPI bool isDLLBlackListed(QString dllFile);
}

#endif
