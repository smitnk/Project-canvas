import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Frame, Layer, OpenToonzStroke, Point } from '../types';
import {
  OpenToonzStrokeGenerator,
  renderOpenToonzStroke,
  openToonzFloodFill
} from '../engine/openToonzEngine';

interface DrawingCanvasProps {
  currentFrame: Frame;
  allFrames: Frame[];
  currentFrameIndex: number;
  layers: Layer[];
  activeLayerId: string;
  tool: 'brush' | 'pencil' | 'raster' | 'eraser' | 'fill';
  brushSize: number;
  brushOpacity: number;
  smoothError: number;
  brushColor: string;
  isVector: boolean;
  showControlPoints: boolean;
  showOnionSkin: boolean;
  onionSkinPrev: number;
  onionSkinNext: number;
  onStrokeCompleted: (stroke: OpenToonzStroke) => void;
  onPressureUpdate: (pressure: number) => void;
  zoom: number;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  currentFrame,
  allFrames,
  currentFrameIndex,
  layers,
  activeLayerId,
  tool,
  brushSize,
  brushOpacity,
  smoothError,
  brushColor,
  isVector,
  showControlPoints,
  showOnionSkin,
  onionSkinPrev,
  onionSkinNext,
  onStrokeCompleted,
  onPressureUpdate,
  zoom,
  pan,
  setPan,
  canvasWidth = 1280,
  canvasHeight = 720,
  backgroundColor = '#ffffff'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  const strokeGeneratorRef = useRef<OpenToonzStrokeGenerator>(new OpenToonzStrokeGenerator());
  const activeStrokePointsRef = useRef<Point[]>([]);

  const CANVAS_WIDTH = canvasWidth;
  const CANVAS_HEIGHT = canvasHeight;

  // Render static layers, strokes, and onion skin
  const redrawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas background
    if (backgroundColor === 'transparent') {
      // Checkerboard pattern for transparency
      const checkSize = 16;
      for (let y = 0; y < canvas.height; y += checkSize) {
        for (let x = 0; x < canvas.width; x += checkSize) {
          ctx.fillStyle = (x / checkSize + y / checkSize) % 2 === 0 ? '#ffffff' : '#e2e8f0';
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw onion skin for previous frames (tinted red/amber)
    if (showOnionSkin) {
      const prevStart = Math.max(0, currentFrameIndex - onionSkinPrev);
      for (let f = prevStart; f < currentFrameIndex; f++) {
        const frame = allFrames[f];
        const dist = currentFrameIndex - f;
        const onionAlpha = Math.max(0.1, 0.45 / dist);

        ctx.save();
        ctx.globalAlpha = onionAlpha;
        for (const layer of layers) {
          if (!layer.visible) continue;
          const strokes = frame.strokesByLayer[layer.id] || [];
          for (const s of strokes) {
            // Tint previous frames red
            const tintedStroke: OpenToonzStroke = {
              ...s,
              color: '#ef4444',
              opacity: s.opacity * onionAlpha,
            };
            renderOpenToonzStroke(ctx, tintedStroke, false);
          }
        }
        ctx.restore();
      }

      // Draw onion skin for next frames (tinted blue/cyan)
      const nextEnd = Math.min(allFrames.length - 1, currentFrameIndex + onionSkinNext);
      for (let f = currentFrameIndex + 1; f <= nextEnd; f++) {
        const frame = allFrames[f];
        const dist = f - currentFrameIndex;
        const onionAlpha = Math.max(0.1, 0.45 / dist);

        ctx.save();
        ctx.globalAlpha = onionAlpha;
        for (const layer of layers) {
          if (!layer.visible) continue;
          const strokes = frame.strokesByLayer[layer.id] || [];
          for (const s of strokes) {
            // Tint next frames blue
            const tintedStroke: OpenToonzStroke = {
              ...s,
              color: '#3b82f6',
              opacity: s.opacity * onionAlpha,
            };
            renderOpenToonzStroke(ctx, tintedStroke, false);
          }
        }
        ctx.restore();
      }
    }

    // Render current frame strokes sorted by layer order
    for (const layer of layers) {
      if (!layer.visible) continue;
      const strokes = currentFrame.strokesByLayer[layer.id] || [];

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      for (const stroke of strokes) {
        renderOpenToonzStroke(ctx, stroke, showControlPoints);
      }
      ctx.restore();
    }
  }, [
    currentFrame,
    allFrames,
    currentFrameIndex,
    layers,
    showOnionSkin,
    onionSkinPrev,
    onionSkinNext,
    showControlPoints,
  ]);

  useEffect(() => {
    redrawMainCanvas();
  }, [redrawMainCanvas]);

  // Convert client viewport coordinates to Canvas coordinate space
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Detect hardware stylus pressure or provide natural dynamic pressure
    let pressure = e.pressure;
    if (pressure === 0 || pressure === 0.5) {
      // Default to 0.7 for standard mice
      pressure = 0.75;
    }
    return { x, y, pressure };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Space or middle-click triggers panning
    if (e.button === 1 || e.buttons === 4 || e.altKey || e.shiftKey) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return;

    // Check if active layer is locked
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer?.locked) {
      return;
    }

    const { x, y, pressure } = getCanvasCoords(e);
    onPressureUpdate(pressure);

    // Handle OpenToonz Flood Fill
    if (tool === 'fill') {
      const mainCanvas = canvasRef.current;
      if (!mainCanvas) return;
      const ctx = mainCanvas.getContext('2d');
      if (!ctx) return;
      openToonzFloodFill(ctx, Math.round(x), Math.round(y), brushColor, 32);
      return;
    }

    setIsDrawing(true);
    activeStrokePointsRef.current = [{ x, y, pressure, thickness: brushSize * (0.2 + 0.8 * pressure) }];

    const gen = strokeGeneratorRef.current;
    gen.beginStroke(
      x,
      y,
      pressure,
      brushSize,
      brushColor,
      brushOpacity,
      isVector,
      tool,
      smoothError
    );

    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlay.width, overlay.height);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    const { x, y, pressure } = getCanvasCoords(e);
    onPressureUpdate(pressure);

    const gen = strokeGeneratorRef.current;
    gen.addPoint(x, y, pressure);
    activeStrokePointsRef.current.push({
      x,
      y,
      pressure,
      thickness: brushSize * (0.2 + 0.8 * pressure),
    });

    // Draw live stroke feedback onto the overlay canvas
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const pts = activeStrokePointsRef.current;
    if (pts.length < 2) return;

    ctx.save();
    ctx.globalAlpha = brushOpacity;
    if (tool === 'eraser') {
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
    } else {
      ctx.strokeStyle = brushColor;
    }

    ctx.lineWidth = brushSize * (0.2 + 0.8 * pressure);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    // Clear overlay
    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlay.width, overlay.height);
      }
    }

    const gen = strokeGeneratorRef.current;
    const completedStroke = gen.endStroke();
    if (completedStroke && completedStroke.rawPoints.length > 0) {
      onStrokeCompleted(completedStroke);
    }
    activeStrokePointsRef.current = [];
    onPressureUpdate(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4 select-none cursor-crosshair"
      onPointerLeave={handlePointerUp}
    >
      {/* Pan & Zoom Canvas Container */}
      <div
        className="relative shadow-2xl rounded-sm transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
        }}
      >
        {/* Main Render Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute inset-0 bg-white shadow-lg border border-slate-700 pointer-events-none"
        />

        {/* Interactive Pointer Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 touch-none z-10"
        />
      </div>

      {/* Floating Canvas Meta Badge */}
      <div className="absolute bottom-3 left-4 bg-slate-900/80 backdrop-blur text-slate-400 text-[11px] font-mono px-2.5 py-1 rounded border border-slate-800 pointer-events-none z-10 flex items-center gap-3">
        <span>Frame: {currentFrame.frameNumber}</span>
        <span>Strokes: {(currentFrame.strokesByLayer[activeLayerId] || []).length}</span>
        <span>Resolution: {CANVAS_WIDTH}×{CANVAS_HEIGHT}</span>
      </div>
    </div>
  );
};
