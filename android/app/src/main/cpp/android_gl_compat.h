#pragma once
#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>

#ifndef GLdouble
typedef double GLdouble;
#endif

#ifndef GL_LINE
#define GL_LINE 0x1B01
#endif

#ifndef GL_POLYGON
#define GL_POLYGON 0x0009
#endif

#ifndef GL_BGRA
#define GL_BGRA 0x80E1
#endif

#ifndef GL_ABGR_EXT
#define GL_ABGR_EXT 0x8000
#endif

#ifndef GLUT_STROKE_ROMAN
#define GLUT_STROKE_ROMAN ((void*)0)
#endif

/*
 * Android OpenGL ES declarations only.
 *
 * No fake/no-op OpenToonz or OpenGL implementations belong here.
 * Legacy OpenToonz GL/GLU/GLUT functionality must be recovered from
 * upstream or explicitly ported to Android rather than silently disabled.
 */
