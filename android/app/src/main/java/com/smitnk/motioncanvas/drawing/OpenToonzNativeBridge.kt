package com.smitnk.motioncanvas.drawing

/**
 * JNI Bridge to OpenToonz Native Drawing Engine C++ library (libopentoonz_drawing_engine.so).
 * Upstream OpenToonz commit: 065cc1404ba43019b22a2577d529134c3e01931b (v1.8.0)
 * License: OpenToonz BSD 3-Clause
 */
object OpenToonzNativeBridge {

    private var isNativeLoaded = false

    init {
        try {
            System.loadLibrary("opentoonz_drawing_engine")
            isNativeLoaded = nativeInitEngine()
        } catch (t: Throwable) {
            isNativeLoaded = false
        }
    }

    fun isAvailable(): Boolean = isNativeLoaded

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
