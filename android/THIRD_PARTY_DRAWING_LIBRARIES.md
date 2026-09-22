# Third-party drawing UI libraries

This project keeps the original OpenToonz drawing engine as the authoritative stroke-generation engine.

## Brush library

RasmView 1.2.1 is included as an Apache-2.0 licensed Android brush library source. It provides reusable brush configurations/presets including Pencil, Pen, Calligraphy, AirBrush, Marker, HardEraser, and SoftEraser.

Repository: https://github.com/Raed-Mughaus/DrawingView
Artifact: com.raedapps:rasmview:1.2.1

Important: RasmView's drawing surface is **not** used as the application's canvas renderer. Its brush library is an input/preset resource; strokes continue through the existing OpenToonz StrokeGenerator/TStroke pipeline.

## Professional color wheel

ColorWheel 1.1.13 is included as an MIT licensed Android color-selection library. It provides an HSV color wheel plus GradientSeekBar support for brightness and alpha.

Repository: https://github.com/AntonPopoff/android-color-wheel
Artifact: com.github.antonpopoff:colorwheel:1.1.13

## Integration rule

Do not replace, fork, rewrite, or bypass the original OpenToonz native drawing engine when wiring these libraries into the application.
