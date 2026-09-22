package com.smitnk.motioncanvas.drawing

import android.util.Log

/**
 * JNI Bridge to OpenToonz Native Drawing Engine C++ library (libopentoonz_drawing_engine.so).
 * Upstream OpenToonz commit: 065cc1404ba43019b22a2577d529134c3e01931b (v1.8.0)
 * License: OpenToonz BSD 3-Clause
 */
object OpenToonzNativeBridge {

    private const val TAG = "OpenToonzNativeBridge"
    private var isNativeLoaded = false
    private var loadError: Throwable? = null

    init {
        try {
            System.loadLibrary("opentoonz_drawing_engine")
            isNativeLoaded = nativeInitEngine()
        } catch (t: Throwable) {
            loadError = t
            isNativeLoaded = false
            Log.e(
                TAG,
                "OpenToonz native engine failed to load; software drawing fallback will be used",
                t
            )
        }
    }

    fun isAvailable(): Boolean = isNativeLoaded

    fun getLoadError(): Throwable? = loadError

    external fun nativeInitEngine(): Boolean
    external fun nativeGetCommitSha(): String
    external fun nativeGetLicenseNotice(): String
    external fun nativeBeginStroke(
        x: Float, y: Float, pressure: Float,
        baseSize: Float, color: Int, opacity: Float,
        isVector: Boolean, smoothError: Float
    )
    external fun nativeAddPoint(x: Float, y: Float, pressure: Float)
    external fun nativeEndStroke(): FloatArray?
    external fun nativeSetBrushSettings(size: Float, opacity: Float, color: Int)
}
