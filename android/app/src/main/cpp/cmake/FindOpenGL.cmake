# Android OpenGL compatibility package for the real GL4ES + GLES stack.
#
# FreeGLUT 3.8.0 asks CMake 3.22's FindOpenGL module for the desktop
# OpenGL component. Android NDK does not ship libOpenGL.so; GL4ES is the
# actual compatibility implementation that provides that desktop API over
# GLES. This module maps the requested CMake targets to the real libraries.

if(NOT ANDROID)
    set(OpenGL_FOUND FALSE)
    return()
endif()

find_library(ANDROID_EGL_LIBRARY EGL REQUIRED)
find_library(ANDROID_GLES2_LIBRARY GLESv2 REQUIRED)

if(NOT TARGET OpenGL::OpenGL)
    add_library(OpenGL::OpenGL INTERFACE IMPORTED GLOBAL)
    set_property(TARGET OpenGL::OpenGL PROPERTY
        INTERFACE_LINK_LIBRARIES GL)
endif()

if(NOT TARGET OpenGL::EGL)
    add_library(OpenGL::EGL INTERFACE IMPORTED GLOBAL)
    set_property(TARGET OpenGL::EGL PROPERTY
        INTERFACE_LINK_LIBRARIES ${ANDROID_EGL_LIBRARY})
endif()

set(OPENGL_opengl_LIBRARY GL)
set(OPENGL_egl_LIBRARY ${ANDROID_EGL_LIBRARY})
set(OPENGL_INCLUDE_DIR "${CMAKE_CURRENT_LIST_DIR}/../gl4es/include")

set(OpenGL_OpenGL_FOUND TRUE)
set(OpenGL_EGL_FOUND TRUE)
set(OpenGL_FOUND TRUE)
set(OPENGL_FOUND TRUE)
