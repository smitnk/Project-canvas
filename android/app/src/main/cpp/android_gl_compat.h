#pragma once
#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>
#ifndef GLdouble
typedef double GLdouble;
#endif
#ifndef GL_LINE
#define GL_LINE 0x1B01
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
#ifndef glVertex2d
static inline void glVertex2d(GLdouble, GLdouble) {}
#endif
#ifndef glVertex2i
static inline void glVertex2i(GLint, GLint) {}
#endif
#ifndef glColor4ub
static inline void glColor4ub(GLubyte, GLubyte, GLubyte, GLubyte) {}
#endif
#ifndef glColor4d
static inline void glColor4d(GLdouble, GLdouble, GLdouble, GLdouble) {}
#endif
#ifndef glMultMatrixd
static inline void glMultMatrixd(const GLdouble*) {}
#endif
#ifndef glBegin
static inline void glBegin(GLenum) {}
#endif
#ifndef glEnd
static inline void glEnd() {}
#endif
#ifndef glLineWidth
static inline void glLineWidth(GLfloat) {}
#endif
#ifndef glPointSize
static inline void glPointSize(GLfloat) {}
#endif
#ifndef glEnable
static inline void glEnable(GLenum) {}
#endif
#ifndef glDisable
static inline void glDisable(GLenum) {}
#endif
#ifndef glBlendFunc
static inline void glBlendFunc(GLenum, GLenum) {}
#endif
#ifndef glColorMask
static inline void glColorMask(GLboolean, GLboolean, GLboolean, GLboolean) {}
#endif
#ifndef glGetBooleanv
static inline void glGetBooleanv(GLenum, GLboolean*) {}
#endif
#ifndef glGetError
static inline GLenum glGetError() { return GL_NO_ERROR; }
#endif
