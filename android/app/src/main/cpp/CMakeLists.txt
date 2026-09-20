cmake_minimum_required(VERSION 3.22.1)

project("opentoonz_drawing_engine")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_definitions(
    -DLINUX
    -DTNZ_LITTLE_ENDIAN=1
)

# OpenToonz public/common headers
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/qt_shim
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvectorimage
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvrender
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgeometry
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/traster
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcolor
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgl
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)

# ==========================================================
# Real Android OpenGL compatibility dependencies
# GL4ES supplies the desktop OpenGL 1.5/2.x API on GLES hardware.
# FreeGLUT supplies the real GLUT API used by OpenToonz TGL.
# Both are fetched at pinned upstream commits by the Android build workflow.
# ==========================================================
set(GL4ES_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/gl4es)
set(FREEGLUT_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/freeglut)

# FreeGLUT 3.8.0 asks CMake 3.22 for a desktop OpenGL package even in its
# Android GLES path. Map that package to the real GL4ES + Android EGL stack.
list(PREPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

set(STATICLIB ON CACHE BOOL "" FORCE)
set(DEFAULT_ES 2 CACHE STRING "" FORCE)
set(NOX11 ON CACHE BOOL "" FORCE)
set(NO_GBM ON CACHE BOOL "" FORCE)
set(USE_ANDROID_LOG ON CACHE BOOL "" FORCE)
add_subdirectory(${GL4ES_SOURCE_DIR} ${CMAKE_CURRENT_BINARY_DIR}/gl4es)

set(FREEGLUT_GLES ON CACHE BOOL "" FORCE)
set(FREEGLUT_BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(FREEGLUT_BUILD_STATIC_LIBS ON CACHE BOOL "" FORCE)
set(FREEGLUT_BUILD_DEMOS OFF CACHE BOOL "" FORCE)
set(FREEGLUT_REPLACE_GLUT ON CACHE BOOL "" FORCE)
add_subdirectory(${FREEGLUT_SOURCE_DIR} ${CMAKE_CURRENT_BINARY_DIR}/freeglut)

include_directories(
    ${GL4ES_SOURCE_DIR}/include
    ${FREEGLUT_SOURCE_DIR}/include
)

# ==========================================================
# REAL OPENTOONZ LOW-LEVEL DRAWING SOURCES
# ==========================================================
# These files already exist in the supplied project.
# They must be compiled instead of merely being stored in the tree.

set(OPENTOONZ_DRAWING_SOURCES

    # Existing ProjectCanvas adapter and platform support
    OpenToonzEngineCore.cpp
    OpenToonzNativeBridge.cpp
    OpenToonzRuntimeSupport.cpp

    # ------------------------------------------------------
    # Actual OpenToonz stroke generation
    # ------------------------------------------------------
    opentoonz/toonz/sources/toonzlib/strokegenerator.cpp
    opentoonz/toonz/sources/common/tvectorimage/tstroke.cpp

    # ------------------------------------------------------
    # Actual OpenToonz geometry dependencies
    # ------------------------------------------------------
    opentoonz/toonz/sources/common/tgeometry/tcurves.cpp
    opentoonz/toonz/sources/common/tgeometry/tcurveutil.cpp
    opentoonz/toonz/sources/common/tgeometry/tgeometry.cpp
    opentoonz/toonz/sources/common/tvectorimage/cornerdetector.cpp
    opentoonz/toonz/sources/common/tvectorimage/tstrokeoutline.cpp
    opentoonz/toonz/sources/common/tvrender/tstrokeutil.cpp
    opentoonz/toonz/sources/common/tvrender/tellipticbrush.cpp

    # ------------------------------------------------------
    # Actual OpenToonz core dependencies
    # ------------------------------------------------------
    opentoonz/toonz/sources/common/tcore/tsmartpointer.cpp
    opentoonz/toonz/sources/common/tcore/texception.cpp
    opentoonz/toonz/sources/common/tcore/tmathutil.cpp
    opentoonz/toonz/sources/common/tcore/tstring.cpp

    # Recovered OpenToonz v1.8.0 implementations required by the drawing dependency chain
    opentoonz/toonz/sources/common/traster/traster.cpp
    opentoonz/toonz/sources/common/tcolor/tpixel.cpp
    opentoonz/toonz/sources/common/tvrender/tvectorbrush.cpp
    opentoonz/toonz/sources/common/tgl/tgl.cpp

    # ------------------------------------------------------
    # Vector image/style sources already present in v29
    # ------------------------------------------------------
    opentoonz/toonz/sources/common/tvectorimage/tvectorimage.cpp
    opentoonz/toonz/sources/common/tvrender/tvectorbrushstyle.cpp

    # ------------------------------------------------------
    # Actual OpenToonz raster brush sources already present
    # ------------------------------------------------------
    opentoonz/toonz/sources/toonzlib/rasterbrush.cpp
    opentoonz/toonz/sources/toonzlib/rasterstrokegenerator.cpp
)

add_library(
    opentoonz_drawing_engine
    SHARED
    ${OPENTOONZ_DRAWING_SOURCES}
)

if(ANDROID)
    find_library(log-lib log)
    find_library(jnigraphics-lib jnigraphics)
    find_library(gles2-lib GLESv2)

    target_link_libraries(
        opentoonz_drawing_engine
        ${log-lib}
        ${jnigraphics-lib}
        ${gles2-lib}
        GL
        freeglut_static
    )
endif()

# Keep the OpenToonz source visible to the compiler so the build does not
# accidentally resolve against an unrelated system copy.
target_include_directories(
    opentoonz_drawing_engine PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/traster
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcolor
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgl
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgeometry
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvectorimage
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvrender
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)
