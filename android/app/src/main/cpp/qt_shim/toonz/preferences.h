#pragma once
#ifndef PREFERENCES_INCLUDED
#define PREFERENCES_INCLUDED

class Preferences {
public:
  static Preferences* instance() {
    static Preferences s_instance;
    return &s_instance;
  }
  bool getShow0ThickLines() const { return false; }
};

#endif
