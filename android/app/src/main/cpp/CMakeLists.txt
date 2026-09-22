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
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgl
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)

if(ANDROID)
    set(MESA_GLU_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/glu)
    file(GLOB_RECURSE MESA_GLU_SOURCES CONFIGURE_DEPENDS
        ${MESA_GLU_SOURCE_DIR}/src/*.c
        ${MESA_GLU_SOURCE_DIR}/src/*.cc
    )
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
        ${CMAKE_CURRENT_SOURCE_DIR}/gl4es/include
    )
    target_compile_definitions(mesa_glu PRIVATE LIBRARYBUILD _GNU_SOURCE NDEBUG)
    target_compile_options(mesa_glu PRIVATE
        "SHELL:-include assert.h"
        "SHELL:-include limits.h"
    )
    target_link_libraries(mesa_glu PUBLIC GL)

    set(GL4ES_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/gl4es)
    set(STATICLIB ON CACHE BOOL "" FORCE)
    set(NOX11 ON CACHE BOOL "" FORCE)
    set(NO_GBM ON CACHE BOOL "" FORCE)
    set(DEFAULT_ES 2 CACHE STRING "" FORCE)
    add_subdirectory(${GL4ES_SOURCE_DIR} gl4es-build EXCLUDE_FROM_ALL)
    include_directories(${GL4ES_SOURCE_DIR}/include)
endif()

set(OPENTOONZ_DRAWING_SOURCES
    OpenToonzEngineCore.cpp
    OpenToonzNativeBridge.cpp
    OpenToonzRuntimeSupport.cpp
    opentoonz/toonz/sources/toonzlib/strokegenerator.cpp
    opentoonz/toonz/sources/common/tvectorimage/tstroke.cpp
    opentoonz/toonz/sources/common/tgeometry/tcurves.cpp
    opentoonz/toonz/sources/common/tgeometry/tcurveutil.cpp
    opentoonz/toonz/sources/common/tgeometry/tgeometry.cpp
    opentoonz/toonz/sources/common/tvectorimage/cornerdetector.cpp
    opentoonz/toonz/sources/common/tvectorimage/tstrokeoutline.cpp
    opentoonz/toonz/sources/common/tvrender/tstrokeutil.cpp
    opentoonz/toonz/sources/common/tvrender/tellipticbrush.cpp
    opentoonz/toonz/sources/common/tcore/tsmartpointer.cpp
    opentoonz/toonz/sources/common/tcore/texception.cpp
    opentoonz/toonz/sources/common/tcore/tmathutil.cpp
    opentoonz/toonz/sources/common/tcore/tstring.cpp
    opentoonz/toonz/sources/common/tsystem/tfilepath.cpp
    opentoonz/toonz/sources/common/tsystem/tfiletype.cpp
)

add_library(
    opentoonz_drawing_engine
    SHARED
    ${OPENTOONZ_DRAWING_SOURCES}
)

if(ANDROID)
    # Android 15+/16KB page-size compatibility.
    # Keep OpenToonz/GL4ES as the real native engine; this only controls ELF
    # LOAD segment alignment in the final shared library.
    target_link_options(opentoonz_drawing_engine PRIVATE
        "-Wl,-z,max-page-size=16384"
    )

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
    )
endif()

target_include_directories(
    opentoonz_drawing_engine PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tcore
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgeometry
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tgl
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvectorimage
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/common/tvrender
    ${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/toonzlib
)
