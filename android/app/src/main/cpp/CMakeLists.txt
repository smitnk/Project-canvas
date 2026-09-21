cmake_minimum_required(VERSION 3.22.1)

project("opentoonz_drawing_engine")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_definitions(
    -DTNZ_LITTLE_ENDIAN=1
)

# OpenToonz public/common headers
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
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

# Build the real GL4ES compatibility layer first.
add_subdirectory(${GL4ES_SOURCE_DIR} gl4es-build EXCLUDE_FROM_ALL)

# Real Mesa GLU 9.0.3. Compile upstream GLU against GL4ES; no stubs.
# LZ4 provides the real LZ4 frame API used by OpenToonz tstream.
# Build the core library sources directly with the Android NDK. This keeps
# the headless engine independent of LZ4's optional CMake targets/tools.
set(BOOST_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/boost)
set(LZ4_DIR ${CMAKE_CURRENT_SOURCE_DIR}/lz4/lib)

add_library(lz4_static STATIC
    ${LZ4_DIR}/lz4.c
    ${LZ4_DIR}/lz4frame.c
    ${LZ4_DIR}/lz4hc.c
    ${LZ4_DIR}/xxhash.c
)

target_include_directories(lz4_static PUBLIC
    ${LZ4_DIR}
)

set_target_properties(lz4_static PROPERTIES
    POSITION_INDEPENDENT_CODE ON
    C_VISIBILITY_PRESET default
)

set(MESA_GLU_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/glu)
file(GLOB_RECURSE MESA_GLU_SOURCES CONFIGURE_DEPENDS
    ${MESA_GLU_SOURCE_DIR}/src/*.c
    ${MESA_GLU_SOURCE_DIR}/src/*.cc
)

# priorityq-heap.c is textually included by priorityq.c in Mesa GLU.
# Do not compile it as a second translation unit: that would expose
# implementation-only dependencies and can produce duplicate symbols.
set(MESA_GLU_PRIORITYQ_HEAP
    ${MESA_GLU_SOURCE_DIR}/src/libtess/priorityq-heap.c
)
list(REMOVE_ITEM MESA_GLU_SOURCES ${MESA_GLU_PRIORITYQ_HEAP})

add_library(mesa_glu STATIC ${MESA_GLU_SOURCES})
target_include_directories(mesa_glu PUBLIC
    ${MESA_GLU_SOURCE_DIR}/include
    ${MESA_GLU_SOURCE_DIR}/src/include
    ${MESA_GLU_SOURCE_DIR}/src/libnurbs/interface
    ${MESA_GLU_SOURCE_DIR}/src/libnurbs/internals
    ${MESA_GLU_SOURCE_DIR}/src/libnurbs/nurbtess
    ${MESA_GLU_SOURCE_DIR}/src/libtess
    ${MESA_GLU_SOURCE_DIR}/src/libutil
    ${GL4ES_SOURCE_DIR}/include
)
# Mesa GLU's legacy NURBS sources assume assert() is available through the
# historical build environment. Android/Clang does not implicitly provide it.
# Build GLU as a release-style utility library so its internal debug-only
# _glu_dprintf() calls are excluded, while still providing assert().
target_compile_definitions(mesa_glu PRIVATE
    LIBRARYBUILD
    _GNU_SOURCE
    NDEBUG
)
target_compile_options(mesa_glu PRIVATE
    "SHELL:-include assert.h"
    "SHELL:-include limits.h"
)

target_link_libraries(mesa_glu PUBLIC GL)

# FreeGLUT is intentionally not part of the Android drawing path.
# OpenToonz legacy stroke-font helpers are disabled on Android; core drawing uses GL4ES directly.

include_directories(
    ${GL4ES_SOURCE_DIR}/include
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
    opentoonz/toonz/sources/common/tvectorimage/tregion.cpp
opentoonz/toonz/sources/common/tvrender/tregionprop.cpp
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
    opentoonz/toonz/sources/common/tcore/tstopwatch.cpp

    # Recovered OpenToonz v1.8.0 implementations required by the drawing dependency chain
    opentoonz/toonz/sources/common/traster/traster.cpp
    opentoonz/toonz/sources/common/tcolor/tpixel.cpp
    opentoonz/toonz/sources/common/tvrender/tvectorbrush.cpp
    opentoonz/toonz/sources/common/tgl/tgl.cpp
    opentoonz/toonz/sources/common/tsystem/tbigmemorymanager.cpp
    opentoonz/toonz/sources/common/trop/trop.cpp
    opentoonz/toonz/sources/common/trop/tresample.cpp
    opentoonz/toonz/sources/common/trop/quickput.cpp
    opentoonz/toonz/sources/common/trop/tover.cpp
    opentoonz/toonz/sources/common/tvrender/tpaletteutil.cpp
    opentoonz/toonz/sources/common/tvectorimage/drawutil.cpp
    opentoonz/toonz/sources/common/tvectorimage/tl2lautocloser.cpp
    opentoonz/toonz/sources/common/trop/tropcm.cpp
    opentoonz/toonz/sources/common/trop/toperators.cpp
    opentoonz/toonz/sources/common/tcolor/tpixelutils.cpp
    opentoonz/toonz/sources/common/trasterimage/trasterimage.cpp
    opentoonz/toonz/sources/common/ttoonzimage/ttonzimage.cpp
    opentoonz/toonz/sources/common/tcache/timagecache.cpp
    opentoonz/toonz/sources/common/timage_io/timage_io.cpp
    opentoonz/toonz/sources/common/tsystem/tfilepath_io.cpp
    opentoonz/toonz/sources/common/tsystem/tsystempd.cpp
    opentoonz/toonz/sources/common/tsystem/tsystem.cpp
    opentoonz/toonz/sources/common/tsystem/tfiletype.cpp
    opentoonz/toonz/sources/common/tstream/tstream.cpp

    # ------------------------------------------------------
    # Vector image/style sources already present in v29
    # ------------------------------------------------------
    opentoonz/toonz/sources/common/tvectorimage/tvectorimage.cpp
    opentoonz/toonz/sources/common/tvectorimage/tcomputeregions.cpp

    # Missing but required implementations in the OpenToonz v1.8.0 dependency chain
    opentoonz/toonz/sources/common/timage/timage.cpp
    opentoonz/toonz/sources/common/timage/tlevel.cpp
    opentoonz/toonz/sources/common/tsystem/tfilepath.cpp
    opentoonz/toonz/sources/common/tvrender/tcolorstyles.cpp
    opentoonz/toonz/sources/common/tvrender/tpalette.cpp
    opentoonz/toonz/sources/common/tvrender/tsimplecolorstyles.cpp
    opentoonz/toonz/sources/common/tvrender/tofflinegl.cpp

    opentoonz/toonz/sources/common/tvrender/tvectorbrushstyle.cpp
    opentoonz/toonz/sources/common/tvrender/tstrokeprop.cpp
    opentoonz/toonz/sources/common/tgl/tstencilcontrol.cpp

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
    find_library(egl-lib EGL)

    target_link_libraries(
        opentoonz_drawing_engine
        ${log-lib}
        ${jnigraphics-lib}
        ${gles2-lib}
        ${egl-lib}
        GL
        mesa_glu
        lz4_static
    )
endif()

# Keep the OpenToonz source visible to the compiler so the build does not
# accidentally resolve against an unrelated system copy.
target_include_directories(
    opentoonz_drawing_engine PRIVATE
    ${LZ4_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/qt_shim
    ${BOOST_ROOT_DIR}
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
