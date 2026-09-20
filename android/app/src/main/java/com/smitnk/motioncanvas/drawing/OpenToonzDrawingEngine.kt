package com.smitnk.motioncanvas.drawing

import android.util.Log
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path

/**
 * OpenToonz Native Drawing Engine adapter for Project Canvas (MotionCanvas v29).
 *
 * Upstream OpenToonz source commit: 065cc1404ba43019b22a2577d529134c3e01931b (v1.8.0)
 * License: OpenToonz Modified BSD License.
 *
 * This adapter connects Android stylus/touch MotionEvent inputs directly to
 * OpenToonz native StrokeGenerator, TStroke, and TVectorImage pipelines via JNI.
 */
object OpenToonzDrawingEngine {

    private const val TAG = "OpenToonzDrawingEngine"
    const val OPENTOONZ_COMMIT = "065cc1404ba43019b22a2577d529134c3e01931b"

    data class StrokePoint(val offset: Offset, val pressure: Float)

    data class QuadSegment(
        val p0: Offset,
        val p1: Offset, // Control point
        val p2: Offset,
        val startThick: Float,
        val midThick: Float,
        val endThick: Float
    )

    data class GeneratedStroke(
        val segments: List<QuadSegment>,
        val minX: Float,
        val minY: Float,
        val maxX: Float,
        val maxY: Float,
        val isVector: Boolean = true
    )

    fun isNativeAvailable(): Boolean = OpenToonzNativeBridge.isAvailable()

    fun getCommitSha(): String =
        if (isNativeAvailable()) OpenToonzNativeBridge.nativeGetCommitSha() else OPENTOONZ_COMMIT

    fun getLicenseNotice(): String =
        if (isNativeAvailable()) OpenToonzNativeBridge.nativeGetLicenseNotice()
        else "OpenToonz Drawing Engine\nCopyright (c) 2016 DWANGO Co., Ltd. & Digital Video S.p.A.\nBSD-3-Clause"

    /**
     * Start a new stroke in the OpenToonz drawing pipeline.
     */
    fun beginStroke(
        start: Offset,
        pressure: Float,
        baseSize: Float,
        color: Color,
        opacity: Float = 1f,
        isVector: Boolean = true,
        smoothError: Float = 4.0f
    ) {
        if (isNativeAvailable()) {
            val argb = (opacity * 255).toInt().shl(24) or
                    (color.red * 255).toInt().shl(16) or
                    (color.green * 255).toInt().shl(8) or
                    (color.blue * 255).toInt()
            OpenToonzNativeBridge.nativeBeginStroke(
                start.x, start.y, pressure,
                baseSize, argb, opacity, isVector, smoothError
            )
        }
    }

    /**
     * Add touch/stylus point with real hardware pressure to OpenToonz StrokeGenerator.
     */
    fun addPoint(point: Offset, pressure: Float) {
        if (isNativeAvailable()) {
            OpenToonzNativeBridge.nativeAddPoint(point.x, point.y, pressure)
        }
    }

    /**
     * Complete stroke generation using OpenToonz StrokeGenerator quad-bezier solver.
     */
    fun endStroke(
        points: List<StrokePoint>,
        baseSize: Float,
        smoothError: Float = 4f
    ): GeneratedStroke {
        check(isNativeAvailable()) {
            "OpenToonz native drawing engine is unavailable"
        }

        val raw = OpenToonzNativeBridge.nativeEndStroke()
            ?: error("OpenToonz native stroke generation returned null")

        require(raw.size >= 5) {
            "OpenToonz native stroke result is invalid"
        }

        val segCount = raw[0].toInt()
        require(segCount >= 0) {
            "OpenToonz native stroke segment count is invalid"
        }

        val minX = raw[1]
        val minY = raw[2]
        val maxX = raw[3]
        val maxY = raw[4]

        val segments = ArrayList<QuadSegment>(segCount)
        var idx = 5

        repeat(segCount) {
            require(idx + 9 <= raw.size) {
                "OpenToonz native stroke buffer is truncated"
            }

            val p0 = Offset(raw[idx], raw[idx + 1])
            val p1 = Offset(raw[idx + 2], raw[idx + 3])
            val p2 = Offset(raw[idx + 4], raw[idx + 5])

            val sThick = raw[idx + 6]
            val mThick = raw[idx + 7]
            val eThick = raw[idx + 8]

            idx += 9

            segments += QuadSegment(
                p0, p1, p2,
                sThick, mThick, eThick
            )
        }

        Log.d(TAG, "OpenToonz TStroke completed with ${segments.size} quad bezier segments; bounds=[$minX, $minY, $maxX, $maxY] passed to MotionCanvas renderer")

        return GeneratedStroke(
            segments = segments,
            minX = minX,
            minY = minY,
            maxX = maxX,
            maxY = maxY
        )
    }

    /**
     * Generate a complete stroke from stored input points using a fresh
     * OpenToonz native StrokeGenerator. Used for previews and persisted strokes.
     */
    fun generateStroke(
        points: List<com.smitnk.motioncanvas.DrawPoint>,
        baseSize: Float,
        color: Color,
        opacity: Float = 1f,
        isVector: Boolean = true,
        smoothError: Float = 4f
    ): GeneratedStroke {
        check(isNativeAvailable()) { "OpenToonz native drawing engine is unavailable" }
        require(points.size >= 2) { "At least two points are required" }

        beginStroke(
            start = points.first().let { Offset(it.x, it.y) },
            pressure = points.first().pressure,
            baseSize = baseSize,
            color = color,
            opacity = opacity,
            isVector = isVector,
            smoothError = smoothError
        )
        for (point in points.drop(1)) {
            addPoint(Offset(point.x, point.y), point.pressure)
        }
        return endStroke(points.map { StrokePoint(Offset(it.x, it.y), it.pressure) }, baseSize, smoothError)
    }

    fun toComposePath(stroke: GeneratedStroke): Path {
        val path = Path()
        if (stroke.segments.isEmpty()) return path
        path.moveTo(stroke.segments[0].p0.x, stroke.segments[0].p0.y)
        for (seg in stroke.segments) {
            path.quadraticBezierTo(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y)
        }
        return path
    }
}
