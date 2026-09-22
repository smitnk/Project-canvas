// Android-native subset of upstream OpenToonz TLevelReader implementation.
// Writer/Qt desktop filesystem code is intentionally excluded.


// TnzCore includes
#include "tsystem.h"
#include "tiio.h"
#include "tcontenthistory.h"
#include "tconvert.h"
#include "tmsgcore.h"

// STD includes
#include <map>

// Qt includes

#include "tlevel_io.h"

using namespace std;

DEFINE_CLASS_CODE(TLevelReader, 8)
DEFINE_CLASS_CODE(TLevelWriter, 9)
// DEFINE_CLASS_CODE(TLevelReaderWriter, 25)  //brutto

//-----------------------------------------------------------

typedef std::pair<QString, int> LevelReaderKey;
std::map<LevelReaderKey, TLevelReaderCreateProc *> LevelReaderTable;
std::map<QString, std::pair<TLevelWriterCreateProc *, bool>> LevelWriterTable;
// std::map<std::string, TLevelReaderWriterCreateProc*> LevelReaderWriterTable;

//-----------------------------------------------------------

TLevelReader::TLevelReader(const TFilePath &path)
    : TSmartObject(m_classCode)
    , m_info(0)
    , m_path(path)
    , m_contentHistory(0)
    , m_frameFormat(TFrameId::FOUR_ZEROS) {}

//-----------------------------------------------------------

TLevelReader::~TLevelReader() {
  delete m_contentHistory;
  delete m_info;
}

//-----------------------------------------------------------

TLevelReaderP::TLevelReaderP(const TFilePath &path, int reader) {
  QString extension = QString::fromStdString(toLower(path.getType()));
  LevelReaderKey key(extension, reader);
  std::map<LevelReaderKey, TLevelReaderCreateProc *>::iterator it;
  it = LevelReaderTable.find(key);
  if (it != LevelReaderTable.end()) {
    m_pointer = it->second(path);
    assert(m_pointer);
  } else {
    m_pointer = new TLevelReader(path);
  }
  m_pointer->addRef();
}

//-----------------------------------------------------------

namespace {
bool myLess(const TFilePath &l, const TFilePath &r) {
  return l.getFrame() < r.getFrame();
}
}  // namespace

//-----------------------------------------------------------

const TImageInfo *TLevelReader::getImageInfo(TFrameId fid) {
  if (m_info)
    return m_info;
  else {
    TImageReaderP frameReader = getFrameReader(fid);
    if (!frameReader) return 0;

    const TImageInfo *fInfo = frameReader->getImageInfo();
    if (!fInfo) return 0;

    m_info = new TImageInfo(*fInfo);
    if (m_info->m_properties)
      m_info->m_properties = m_info->m_properties->clone();

    return m_info;
  }
}

//-----------------------------------------------------------

const TImageInfo *TLevelReader::getImageInfo() {
  if (m_info) return m_info;
  TLevelP level = loadInfo();
  if (level->getFrameCount() == 0) return 0;
  return getImageInfo(level->begin()->first);
}

//-----------------------------------------------------------

TLevelP TLevelReader::loadInfo() {
  TFilePath parentDir = m_path.getParentDir();
  TFilePath levelName(m_path.getLevelName());
  //  cout << "Parent dir = '" << parentDir << "'" << endl;
  //  cout << "Level name = '" << levelName << "'" << endl;
  TFilePathSet files;
  try {
    files = TSystem::readDirectory(parentDir, false, true, true);
  } catch (...) {
    throw TImageException(m_path, "unable to read directory content");
  }
  TLevelP level;
  vector<TFilePath> data;
  for (TFilePathSet::iterator it = files.begin(); it != files.end(); it++) {
    TFilePath ln(it->getLevelName());
    // cout << "try " << *it << "  " << it->getLevelName() <<  endl;
    if (levelName == TFilePath(it->getLevelName())) {
      level->setFrame(it->getFrame(), TImageP());
      data.push_back(*it);
    }
  }
  if (!data.empty()) {
    std::vector<TFilePath>::iterator it =
        std::min_element(data.begin(), data.end(), myLess);

    m_frameFormat = (*it).getFrame().getCurrentFormat();
    /*
    TFilePath fr = (*it).withoutParentDir().withName("").withType("");
    wstring ws   = fr.getWideString();
    if (ws.length() == 5) {
      if (ws.rfind(L'_') == (int)wstring::npos)
        m_frameFormat = TFrameId::FOUR_ZEROS;
      else
        m_frameFormat = TFrameId::UNDERSCORE_FOUR_ZEROS;
    } else if (ws.rfind(L'0') == 1) {  // leads with any number of zeros
      if (ws.rfind(L'_') == (int)wstring::npos)
        m_frameFormat = TFrameId::CUSTOM_PAD;
      else
        m_frameFormat = TFrameId::UNDERSCORE_CUSTOM_PAD;
    } else {
      if (ws.rfind(L'_') == (int)wstring::npos)
        m_frameFormat = TFrameId::NO_PAD;
      else
        m_frameFormat = TFrameId::UNDERSCORE_NO_PAD;
    }
    */
  } else
    m_frameFormat = TFrameId::FOUR_ZEROS;

  return level;
}

//-----------------------------------------------------------

TImageReaderP TLevelReader::getFrameReader(TFrameId fid) {
  return TImageReaderP(m_path.withFrame(fid, m_frameFormat));
}

//-----------------------------------------------------------

void TLevelReader::getSupportedFormats(QStringList &names) {
  for (std::map<LevelReaderKey, TLevelReaderCreateProc *>::iterator it =
           LevelReaderTable.begin();
       it != LevelReaderTable.end(); ++it) {
    names.push_back(it->first.first);
  }
}

//-----------------------------------------------------------

TSoundTrack *TLevelReader::loadSoundTrack() { return 0; }

//===========================================================
