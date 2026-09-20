package com.smitnk.motioncanvas.animation

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import com.smitnk.motioncanvas.DrawStroke
import com.smitnk.motioncanvas.Frame
import kotlin.math.pow

enum class TweenEasing { LINEAR, EASE_IN, EASE_OUT, EASE_IN_OUT }

object TweenEngine {
    fun ease(t: Float, easing: TweenEasing): Float {
        val x = t.coerceIn(0f, 1f)
        return when (easing) {
            TweenEasing.LINEAR -> x
            TweenEasing.EASE_IN -> x * x
            TweenEasing.EASE_OUT -> 1f - (1f - x) * (1f - x)
            TweenEasing.EASE_IN_OUT -> if (x < 0.5f) 2f*x*x else 1f - (-2f*x + 2f).pow(2f)/2f
        }
    }

    fun interpolate(a: Frame, b: Frame, rawT: Float, easing: TweenEasing): Frame {
        val t = ease(rawT, easing)
        val count = maxOf(a.strokes.size, b.strokes.size)
        val strokes = (0 until count).mapNotNull { i ->
            val sa = a.strokes.getOrNull(i) ?: b.strokes.getOrNull(i) ?: return@mapNotNull null
            val sb = b.strokes.getOrNull(i) ?: sa
            val n = maxOf(sa.points.size, sb.points.size)
            if (n == 0) return@mapNotNull null
            fun sample(points: List<com.smitnk.motioncanvas.DrawPoint>, index: Int): Offset {
                if (points.size == 1) return Offset(points[0].x, points[0].y)
                val p = index.toFloat() / (n - 1).coerceAtLeast(1)
                val x = p * (points.size - 1)
                val lo = x.toInt().coerceIn(0, points.lastIndex)
                val hi = (lo + 1).coerceAtMost(points.lastIndex)
                val f = x - lo
                return Offset(
                    points[lo].x + (points[hi].x - points[lo].x)*f,
                    points[lo].y + (points[hi].y - points[lo].y)*f
                )
            }
            val points = (0 until n).map { j ->
                val pa = sample(sa.points, j); val pb = sample(sb.points, j)
                com.smitnk.motioncanvas.DrawPoint(
                    pa.x + (pb.x-pa.x)*t,
                    pa.y + (pb.y-pa.y)*t,
                    sa.points.getOrElse((j * sa.points.size / n).coerceAtMost(sa.points.lastIndex)) { sa.points.last() }.pressure
                )
            }
            sa.copy(
                points = points,
                color = Color(
                    sa.color.red + (sb.color.red-sa.color.red)*t,
                    sa.color.green + (sb.color.green-sa.color.green)*t,
                    sa.color.blue + (sb.color.blue-sa.color.blue)*t,
                    sa.color.alpha + (sb.color.alpha-sa.color.alpha)*t
                ),
                strokeWidth = sa.strokeWidth + (sb.strokeWidth-sa.strokeWidth)*t,
                alpha = sa.alpha + (sb.alpha-sa.alpha)*t
            )
        }.toMutableList()
        return a.copy(strokes = strokes)
    }
}

fun DrawStroke.deepCopy(): DrawStroke = copy(points = points.toList())
