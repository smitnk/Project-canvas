#include "tgeometry.h"
#include "tgl.h"

// Platform-isolated support for headless/Android environment.
// Desktop immediate-mode OpenGL rendering functions (glBegin, glEnd, glVertex2d, etc.)
// are NOT implemented or emulated here.
// Android presentation is handled by the MotionCanvas renderer using native
// OpenToonz TStroke / TThickQuadratic control points.

// tglGetPixelSize2 returns a unit pixel size metric for outline and brush geometry calculations.
double tglGetPixelSize2() {
    return 1.0;
}
