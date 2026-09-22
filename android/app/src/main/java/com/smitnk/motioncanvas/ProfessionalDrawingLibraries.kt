package com.smitnk.motioncanvas

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.github.antonpopoff.colorwheel.ColorWheel

data class ArtboardViewport(
    val workspaceWidth: Float,
    val workspaceHeight: Float,
    val canvasWidth: Float,
    val canvasHeight: Float
) {
    private val fitScale: Float
        get() = if (workspaceWidth <= 0f || workspaceHeight <= 0f ||
            canvasWidth <= 0f || canvasHeight <= 0f) 1f
        else minOf(workspaceWidth / canvasWidth, workspaceHeight / canvasHeight) * 0.92f

    fun effectiveScale(zoom: Float): Float = fitScale * zoom.coerceAtLeast(0.01f)

    fun origin(zoom: Float, pan: androidx.compose.ui.geometry.Offset): androidx.compose.ui.geometry.Offset {
        val s = fitScale * zoom.coerceAtLeast(0.01f)
        return androidx.compose.ui.geometry.Offset(
            (workspaceWidth - canvasWidth * s) / 2f + pan.x,
            (workspaceHeight - canvasHeight * s) / 2f + pan.y
        )
    }

    fun screenToArtboard(
        screen: androidx.compose.ui.geometry.Offset,
        zoom: Float,
        pan: androidx.compose.ui.geometry.Offset
    ): androidx.compose.ui.geometry.Offset {
        val s = fitScale * zoom.coerceAtLeast(0.01f)
        val o = origin(zoom, pan)
        return androidx.compose.ui.geometry.Offset(
            ((screen.x - o.x) / s).coerceIn(0f, canvasWidth),
            ((screen.y - o.y) / s).coerceIn(0f, canvasHeight)
        )
    }

    fun isInside(screen: androidx.compose.ui.geometry.Offset, zoom: Float, pan: androidx.compose.ui.geometry.Offset): Boolean {
        val s = fitScale * zoom.coerceAtLeast(0.01f)
        val o = origin(zoom, pan)
        return screen.x >= o.x && screen.x <= o.x + canvasWidth * s &&
            screen.y >= o.y && screen.y <= o.y + canvasHeight * s
    }
}

data class ImportedBrushPreset(
    val name: String,
    val description: String,
    val size: Float,
    val opacity: Float,
    val textured: Boolean = false
)

val ImportedProfessionalBrushes = listOf(
    ImportedBrushPreset("Pencil", "Fine sketch / construction", 5f, 0.72f),
    ImportedBrushPreset("Pen", "Clean ink line", 6f, 1f),
    ImportedBrushPreset("Calligraphy", "Variable-width lettering", 11f, 0.95f),
    ImportedBrushPreset("Airbrush", "Soft low-flow shading", 42f, 0.28f),
    ImportedBrushPreset("Marker", "Broad opaque marker", 24f, 0.78f),
    ImportedBrushPreset("Ink G-Pen", "Animation clean-up ink", 8f, 1f),
    ImportedBrushPreset("Chalk", "Textured rough stroke", 18f, 0.62f, true),
    ImportedBrushPreset("Soft Eraser", "Soft erase preset", 34f, 0.7f)
)

@Composable
fun ProfessionalBrushLibraryDialog(
    onApply: (ImportedBrushPreset) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Professional Brush Library") },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                items(ImportedProfessionalBrushes) { brush ->
                    Row(
                        modifier = Modifier.fillMaxWidth().clickable { onApply(brush) }
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            Modifier.size(34.dp).background(
                                Color.Black.copy(alpha = brush.opacity),
                                MaterialTheme.shapes.small
                            )
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(brush.name, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                            Text(brush.description, style = MaterialTheme.typography.bodySmall)
                        }
                        Text("${brush.size.toInt()} px")
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } }
    )
}

@Composable
fun ProfessionalColorWheelDialog(
    currentColor: Color,
    onColorChanged: (Color) -> Unit,
    onEyedropperClick: () -> Unit,
    onDismiss: () -> Unit
) {
    var selectedArgb by remember(currentColor) { mutableIntStateOf(currentColor.toArgb()) }
    var value by remember(currentColor) {
        mutableFloatStateOf(FloatArray(3).also {
            android.graphics.Color.colorToHSV(currentColor.toArgb(), it)
        }[2])
    }
    var alpha by remember(currentColor) { mutableFloatStateOf(currentColor.alpha) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Professional Color Wheel") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                AndroidView(
                    modifier = Modifier.fillMaxWidth().height(280.dp),
                    factory = { context ->
                        ColorWheel(context).apply {
                            rgb = currentColor.toArgb()
                            colorChangeListener = { rgb: Int ->
                                selectedArgb = rgb
                                val c = Color(rgb)
                                val hsv = FloatArray(3)
                                android.graphics.Color.colorToHSV(rgb, hsv)
                                value = hsv[2]
                                alpha = c.alpha
                                onColorChanged(c.copy(alpha = alpha))
                            }
                        }
                    },
                    update = { view -> if (view.rgb != selectedArgb) view.rgb = selectedArgb }
                )
                Text("Brightness")
                Slider(
                    value = value,
                    onValueChange = {
                        value = it
                        val hsv = FloatArray(3)
                        android.graphics.Color.colorToHSV(selectedArgb, hsv)
                        hsv[2] = it.coerceIn(0f, 1f)
                        selectedArgb = android.graphics.Color.HSVToColor(
                            (alpha * 255f).toInt().coerceIn(0, 255), hsv
                        )
                        onColorChanged(Color(selectedArgb))
                    },
                    valueRange = 0f..1f
                )
                Text("Opacity")
                Slider(
                    value = alpha,
                    onValueChange = {
                        alpha = it
                        onColorChanged(Color(selectedArgb).copy(alpha = it))
                    },
                    valueRange = 0f..1f
                )
                Button(onClick = onEyedropperClick, modifier = Modifier.fillMaxWidth()) {
                    Text("Eyedropper")
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Done") } }
    )
}
