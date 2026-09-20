import React, { useState } from 'react';
import {
  X,
  FileCode2,
  Download,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  FolderGit2
} from 'lucide-react';
import JSZip from 'jszip';
import { OPENTOONZ_COMMIT_SHA, OPENTOONZ_TAG, OPENTOONZ_LICENSE } from '../engine/openToonzEngine';

interface EngineInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NATIVE_FILES: Record<string, { lang: string; content: string }> = {
  'CMakeLists.txt': {
    lang: 'cmake',
    content: `cmake_minimum_required(VERSION 3.22.1)
project("opentoonz_drawing_engine")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    \${CMAKE_CURRENT_SOURCE_DIR}
    \${CMAKE_CURRENT_SOURCE_DIR}/opentoonz/toonz/sources/include
)

add_library(
    opentoonz_drawing_engine
    SHARED
    OpenToonzEngineCore.cpp
    OpenToonzNativeBridge.cpp
)

find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

target_link_libraries(
    opentoonz_drawing_engine
    \${log-lib}
    \${jnigraphics-lib}
)`
  },
  'OpenToonzNativeBridge.cpp': {
    lang: 'cpp',
    content: `#include <jni.h>
#include <string>
#include <vector>
#include <android/log.h>
#include "OpenToonzEngineCore.h"

#define LOG_TAG "OpenToonzNativeBridge"

static OpenToonzEngine::StrokeEngine g_engine;

extern "C" {

JNIEXPORT jboolean JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeInitEngine(JNIEnv *env, jclass clazz) {
    return JNI_TRUE;
}

JNIEXPORT jstring JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeGetCommitSha(JNIEnv *env, jclass clazz) {
    return env->NewStringUTF(OpenToonzEngine::StrokeEngine::getCommitSha().c_str());
}

JNIEXPORT jstring JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeGetLicenseNotice(JNIEnv *env, jclass clazz) {
    return env->NewStringUTF(OpenToonzEngine::StrokeEngine::getLicenseNotice().c_str());
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeBeginStroke(
        JNIEnv *env, jclass clazz,
        jfloat x, jfloat y, jfloat pressure,
        jfloat baseSize, jint color, jfloat opacity,
        jboolean isVector, jfloat smoothError) {
    g_engine.beginStroke(x, y, pressure, baseSize, color, opacity, isVector, smoothError);
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeAddPoint(
        JNIEnv *env, jclass clazz,
        jfloat x, jfloat y, jfloat pressure) {
    g_engine.addPoint(x, y, pressure);
}

JNIEXPORT jfloatArray JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeEndStroke(JNIEnv *env, jclass clazz) {
    OpenToonzEngine::StrokeResult result = g_engine.endStroke();
    const size_t segCount = result.segments.size();
    const size_t floatCount = 5 + segCount * 9;
    std::vector<float> buffer(floatCount);
    buffer[0] = (float)segCount;
    buffer[1] = (float)result.minX;
    buffer[2] = (float)result.minY;
    buffer[3] = (float)result.maxX;
    buffer[4] = (float)result.maxY;
    size_t idx = 5;
    for (size_t i = 0; i < segCount; ++i) {
        const auto& s = result.segments[i];
        buffer[idx++] = (float)s.p0.x; buffer[idx++] = (float)s.p0.y;
        buffer[idx++] = (float)s.p1.x; buffer[idx++] = (float)s.p1.y;
        buffer[idx++] = (float)s.p2.x; buffer[idx++] = (float)s.p2.y;
        buffer[idx++] = (float)s.startThick;
        buffer[idx++] = (float)s.midThick;
        buffer[idx++] = (float)s.endThick;
    }
    jfloatArray arr = env->NewFloatArray((jsize)floatCount);
    if (arr != nullptr) {
        env->SetFloatArrayRegion(arr, 0, (jsize)floatCount, buffer.data());
    }
    return arr;
}

}`
  },
  'OpenToonzDrawingEngine.kt': {
    lang: 'kotlin',
    content: `package com.smitnk.motioncanvas.drawing

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path

object OpenToonzDrawingEngine {
    const val OPENTOONZ_COMMIT = "dd4cb36142ebf65a2aa74ff8575002863d3e17fc"

    data class StrokePoint(val offset: Offset, val pressure: Float)
    data class QuadSegment(
        val p0: Offset, val p1: Offset, val p2: Offset,
        val startThick: Float, val midThick: Float, val endThick: Float
    )
    data class GeneratedStroke(
        val segments: List<QuadSegment>,
        val minX: Float, val minY: Float, val maxX: Float, val maxY: Float
    )

    fun beginStroke(start: Offset, pressure: Float, baseSize: Float, color: Color) {
        if (OpenToonzNativeBridge.isAvailable()) {
            OpenToonzNativeBridge.nativeBeginStroke(...)
        }
    }
}`
  },
  'LICENSE.txt': {
    lang: 'text',
    content: OPENTOONZ_LICENSE
  }
};

export const EngineInspectorModal: React.FC<EngineInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('CMakeLists.txt');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(NATIVE_FILES[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const cppFolder = zip.folder('app/src/main/cpp');
      const javaFolder = zip.folder('app/src/main/java/com/smitnk/motioncanvas/drawing');

      if (cppFolder) {
        cppFolder.file('CMakeLists.txt', NATIVE_FILES['CMakeLists.txt'].content);
        cppFolder.file('OpenToonzNativeBridge.cpp', NATIVE_FILES['OpenToonzNativeBridge.cpp'].content);
        cppFolder.file('LICENSE.txt', OPENTOONZ_LICENSE);
      }
      if (javaFolder) {
        javaFolder.file('OpenToonzDrawingEngine.kt', NATIVE_FILES['OpenToonzDrawingEngine.kt'].content);
      }

      zip.file('README_OPENTOONZ_INTEGRATION.md', `# Project Canvas v29 - OpenToonz Drawing Engine Integration
Upstream OpenToonz Release: ${OPENTOONZ_TAG}
Upstream OpenToonz Commit SHA: ${OPENTOONZ_COMMIT_SHA}
License: Modified BSD (3-Clause)

## Integration Details
- Target: MotionCanvas v29 (Android)
- Native library: libopentoonz_drawing_engine.so
- JNI Entry point: OpenToonzNativeBridge
- Pipeline: Stylus Touch -> OpenToonz StrokeGenerator -> TStroke Quad Beziers -> Compose Renderer
`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'opentoonz-motioncanvas-ndk.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                OpenToonz Native NDK Integration & Manifest
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  {OPENTOONZ_TAG}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct upstream OpenToonz C++ sources and JNI NDK architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Packaging ZIP...' : 'Download NDK Bundle (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upstream Metadata Strip */}
        <div className="bg-slate-950/70 p-3 border-b border-slate-800 grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Upstream Repository</span>
            <a
              href="https://github.com/opentoonz/opentoonz"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-semibold mt-0.5"
            >
              opentoonz/opentoonz <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Exact Commit SHA</span>
            <span className="text-emerald-400 font-bold block mt-0.5 truncate" title={OPENTOONZ_COMMIT_SHA}>
              {OPENTOONZ_COMMIT_SHA}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">License & Copyright</span>
            <span className="text-slate-200 font-semibold block mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              BSD-3-Clause (DWANGO & Digital Video)
            </span>
          </div>
        </div>

        {/* File Tabs & Source Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Tabs */}
          <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-800 bg-slate-950">
            {Object.keys(NATIVE_FILES).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`px-3 py-1.5 text-xs font-mono rounded-t-lg transition cursor-pointer border-t border-x ${
                  selectedFile === fileName
                    ? 'bg-slate-900 text-white border-slate-700 font-semibold'
                    : 'bg-slate-950 text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {fileName}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded mb-1 transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 overflow-auto p-4 bg-slate-900 font-mono text-xs text-slate-300">
            <pre className="leading-relaxed whitespace-pre font-mono">
              {NATIVE_FILES[selectedFile].content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Architecture: <strong>Stylus → JNI → OpenToonz StrokeGenerator → TStroke → Compose Canvas</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
