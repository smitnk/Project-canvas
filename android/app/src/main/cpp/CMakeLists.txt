cmake_minimum_required(VERSION 3.22.1)

project("opentoonz_drawing_engine")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_definitions(
    -DLINUX
    -DTNZ_LITTLE_ENDIAN=1
)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/qt_shim
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvectorimage
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvrender
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgeometry
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)

# ==========================================================
# REAL OPENTOONZ DRAWING CORE
#
# Reference architecture: keep the real upstream OpenToonz
# stroke/vector mathematics, but do NOT pull the desktop
# application, Qt GUI, TLevel/image-cache stack, or legacy
# OpenGL renderer into the first Android drawing target.
# ==========================================================

set(OPENTOONZ_DRAWING_SOURCES
    OpenToonzEngineCore.cpp
    OpenToonzNativeBridge.cpp

    # Real OpenToonz stroke generation
    opentoonz/toonz/sources/toonzlib/strokegenerator.cpp
    opentoonz/toonz/sources/common/tvectorimage/tstroke.cpp

    # Real OpenToonz geometry dependencies
    opentoonz/toonz/sources/common/tgeometry/tcurves.cpp
    opentoonz/toonz/sources/common/tgeometry/tcurveutil.cpp
    opentoonz/toonz/sources/common/tgeometry/tgeometry.cpp
    opentoonz/toonz/sources/common/tvectorimage/cornerdetector.cpp
    opentoonz/toonz/sources/common/tvectorimage/tstrokeoutline.cpp
    opentoonz/toonz/sources/common/tvrender/tstrokeutil.cpp
    opentoonz/toonz/sources/common/tvrender/tellipticbrush.cpp

    # Real OpenToonz core dependencies
    opentoonz/toonz/sources/common/tcore/tsmartpointer.cpp
    opentoonz/toonz/sources/common/tcore/texception.cpp
    opentoonz/toonz/sources/common/tcore/tmathutil.cpp
    opentoonz/toonz/sources/common/tcore/tstring.cpp

    # Vector source retained because it is part of the
    # OpenToonz drawing-core closure used by the reference.
    opentoonz/toonz/sources/common/tvectorimage/tvectorimage.cpp
    opentoonz/toonz/sources/common/tvrender/tvectorbrushstyle.cpp

    # Existing real OpenToonz brush implementations
    opentoonz/toonz/sources/toonzlib/rasterbrush.cpp
    opentoonz/toonz/sources/toonzlib/rasterstrokegenerator.cpp

    # Android platform adaptation already present in Project Canvas
    opentoonz/toonz/sources/common/tsystem/tsystem_android.cpp
)

add_library(
    opentoonz_drawing_engine
    SHARED
    ${OPENTOONZ_DRAWING_SOURCES}
)

if(ANDROID)
    find_library(log-lib log)
    find_library(jnigraphics-lib jnigraphics)

    target_link_libraries(
        opentoonz_drawing_engine
        ${log-lib}
        ${jnigraphics-lib}
    )
endif()

target_include_directories(
    opentoonz_drawing_engine PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/qt_shim
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgeometry
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvectorimage
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvrender
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)
