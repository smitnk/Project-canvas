#include "tsystem.h"

#include <dirent.h>
#include <sys/stat.h>
#include <unistd.h>
#include <string>

namespace TSystem {

void readDirectory(TFilePathSet &fpset, const TFilePath &path,
                   bool groupFrames, bool onlyFiles, bool getHiddenFiles) {
  (void)groupFrames;
  const std::string base = path.getQString().toStdString();
  DIR *dir = opendir(base.c_str());
  if (!dir) return;

  while (dirent *entry = readdir(dir)) {
    const char *name = entry->d_name;
    if (!name || name[0] == '\0') continue;
    if ((name[0] == '.' && (name[1] == '\0' ||
                            (name[1] == '.' && name[2] == '\0'))) ||
        (!getHiddenFiles && name[0] == '.')) continue;

    std::string full = base;
    if (!full.empty() && full.back() != '/') full += '/';
    full += name;

    struct stat st {};
    if (stat(full.c_str(), &st) != 0) continue;
    if (onlyFiles && !S_ISREG(st.st_mode)) continue;

    fpset.push_back(TFilePath(full));
  }
  closedir(dir);
}

bool doesExistFileOrLevel(const TFilePath &fp) {
  struct stat st {};
  return stat(fp.getQString().toStdString().c_str(), &st) == 0;
}

}  // namespace TSystem
