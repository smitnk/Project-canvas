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
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/traster
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcolor
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgl
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
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
    opentoonz/toonz/sources/common/tvrender/tsimplecolorstyles.cpp
    opentoonz/toonz/sources/common/tvrender/tvectorbrush.cpp
    opentoonz/toonz/sources/common/tgl/tgl.cpp
    opentoonz/toonz/sources/common/tsystem/tfilepath.cpp

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
    )
endif()

# Keep the OpenToonz source visible to the compiler so the build does not
# accidentally resolve against an unrelated system copy.
target_include_directories(
    opentoonz_drawing_engine PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgeometry
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvectorimage
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvrender
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)
