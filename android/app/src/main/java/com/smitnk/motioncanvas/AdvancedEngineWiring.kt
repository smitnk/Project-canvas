package com.smitnk.motioncanvas

import androidx.compose.ui.geometry.Offset
import com.smitnk.motioncanvas.animation.GraphKeyframe
import com.smitnk.motioncanvas.animation.KeyframeGraphEngine
import com.smitnk.motioncanvas.animation.MotionGuide
import com.smitnk.motioncanvas.animation.MotionGuideEngine
import com.smitnk.motioncanvas.camera.Camera2D
import com.smitnk.motioncanvas.tools.BezierPath
import com.smitnk.motioncanvas.tools.BezierPathEngine
import com.smitnk.motioncanvas.tools.LiquifyEngine
import com.smitnk.motioncanvas.tools.MagicWandEngine
import com.smitnk.motioncanvas.tools.Particle
import com.smitnk.motioncanvas.tools.ParticleEmitter
import com.smitnk.motioncanvas.tools.ParticleEngine
import com.smitnk.motioncanvas.tools.PerspectiveGuide
import com.smitnk.motioncanvas.tools.PerspectiveGuideEngine
import com.smitnk.motioncanvas.tools.PrecisionRulerEngine
import com.smitnk.motioncanvas.brush.SmudgeEngine
import com.smitnk.motioncanvas.brush.BrushDynamicsEngine

class AdvancedEngineWiring {
    fun guidePoint(points: List<Offset>, position: Float): Offset? =
        MotionGuideEngine.sample(MotionGuide(points), position)

    fun cameraScale(base: Float, zoom: Float): Float =
        Camera2D(zoom = base).zoomed(zoom).zoom

    fun keyframeValue(frame: Int, keys: List<GraphKeyframe>): Float =
        KeyframeGraphEngine.evaluate(keys, frame)

    fun perspectiveSnap(point: Offset, horizonY: Float, vanishingPoints: List<Offset>): Offset =
        PerspectiveGuideEngine.snap(point, PerspectiveGuide(horizonY, vanishingPoints))

    fun rulerDistance(a: Offset, b: Offset): Float =
        PrecisionRulerEngine.measure(a, b).length

    fun bezierSample(p0: Offset, p1: Offset, p2: Offset, p3: Offset, t: Float): Offset =
        BezierPathEngine.sample(BezierPath(p0, p1, p2, p3), t)

    fun selectionMask(bitmap: android.graphics.Bitmap, point: Offset, tolerance: Int): BooleanArray =
        MagicWandEngine.select(bitmap, point.x.toInt(), point.y.toInt(), tolerance)

    fun liquify(bitmap: android.graphics.Bitmap, point: Offset, delta: Offset, radius: Float, strength: Float) {
        LiquifyEngine.push(bitmap, point.x, point.y, delta.x, delta.y, radius, strength)
    }

    fun particleBurst(origin: Offset, count: Int): List<Particle> =
        ParticleEngine.emit(ParticleEmitter(origin.x, origin.y), count)

    fun smudge(bitmap: android.graphics.Bitmap, from: Offset, to: Offset, radius: Float, strength: Float) {
        SmudgeEngine.smear(bitmap, from, to, radius, strength)
    }

    fun dynamicBrushWidth(baseWidth: Float, pressure: Float, tilt: Float): Float =
        BrushDynamicsEngine.size(baseWidth, pressure, com.smitnk.motioncanvas.brush.BrushDynamics(pressureSize = tilt.coerceIn(0f, 1f)))
}
