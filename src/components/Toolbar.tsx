import React from 'react';
import {
  Home,
  Paintbrush,
  Pencil,
  CircleDot,
  Eraser,
  PaintBucket,
  Undo2,
  Redo2,
  Sliders,
  CheckCircle2,
  FileCode2,
  Download,
  Eye,
  Layers,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { BrushPreset } from '../types';

export const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: 'ot_ink',
    name: 'Toonz Ink',
    tool: 'brush',
    size: 5,
    opacity: 1.0,
    smoothError: 3.5,
    description: 'Crisp vector inking with OpenToonz quad-spline smoothing'
  },
  {
    id: 'ot_pencil',
    name: 'Clean Pencil',
    tool: 'pencil',
    size: 2,
    opacity: 0.9,
    smoothError: 2.0,
    description: 'Fine precision sketch lines with taper'
  },
  {
    id: 'ot_calligraphy',
    name: 'Calligraphy',
    tool: 'brush',
    size: 10,
    opacity: 1.0,
    smoothError: 5.0,
    description: 'Heavy pressure dynamics with sharp responsive ends'
  },
  {
    id: 'ot_raster_brush',
    name: 'Raster Paint',
    tool: 'raster',
    size: 14,
    opacity: 0.85,
    smoothError: 1.0,
    description: 'Continuous circular pixel dab blending'
  },
  {
    id: 'ot_airbrush',
    name: 'Soft Airbrush',
    tool: 'raster',
    size: 28,
    opacity: 0.4,
    smoothError: 1.0,
    description: 'Soft translucent shading'
  }
];

interface ToolbarProps {
  currentTool: 'brush' | 'pencil' | 'raster' | 'eraser' | 'fill';
  setCurrentTool: (tool: 'brush' | 'pencil' | 'raster' | 'eraser' | 'fill') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  smoothError: number;
  setSmoothError: (err: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  isVector: boolean;
  setIsVector: (v: boolean) => void;
  showControlPoints: boolean;
  setShowControlPoints: (show: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenVerification: () => void;
  onOpenInspector: () => void;
  onOpenExport: () => void;
  currentPressure: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onResetZoom: () => void;
  passedCount: number;
  onHome?: () => void;
  projectName?: string;
  showLayers?: boolean;
  onToggleLayers?: () => void;
  showTimeline?: boolean;
  onToggleTimeline?: () => void;
}

const COLOR_SWATCHES = [
  '#0f172a', // Slate dark
  '#dc2626', // Red
  '#ea580c', // Orange
  '#16a34a', // Green
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#ffffff', // White
];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setCurrentTool,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  smoothError,
  setSmoothError,
  brushColor,
  setBrushColor,
  isVector,
  setIsVector,
  showControlPoints,
  setShowControlPoints,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenVerification,
  onOpenInspector,
  onOpenExport,
  currentPressure,
  zoom,
  setZoom,
  onResetZoom,
  passedCount,
  onHome,
  projectName = 'Untitled Animation',
  showLayers = true,
  onToggleLayers,
  showTimeline = true,
  onToggleTimeline,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none z-20">
      {/* App Branding, Home button & Engine Tag */}
      <div className="flex items-center gap-3">
        {onHome && (
          <button
            id="btn-nav-home"
            onClick={onHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Return to MotionCanvas Home"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Home</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm shadow-emerald-900/50">
            C29
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide max-w-[180px] truncate" title={projectName}>
                {projectName}
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                OpenToonz Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Upstream Native Drawing Engine (commit 065cc14)</p>
          </div>
        </div>

        {/* 17-Step Test Badge Button */}
        <button
          id="btn-open-verification"
          onClick={onOpenVerification}
          className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          title="OpenToonz 17-step Build Order verification runner"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${passedCount === 17 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>Verification: <strong className="text-white">{passedCount}/17</strong></span>
        </button>

        {/* Engine Inspector Button */}
        <button
          id="btn-open-inspector"
          onClick={onOpenInspector}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          title="Inspect OpenToonz Native C++ sources, CMakeLists.txt & License"
        >
          <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Engine C++ & NDK</span>
        </button>
      </div>

      {/* Center Tool Selection */}
      <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          id="tool-brush"
          onClick={() => {
            setCurrentTool('brush');
            setIsVector(true);
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
            currentTool === 'brush' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Toonz Vector Brush (TStroke & StrokeGenerator quad-bezier)"
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Toonz Vector</span>
        </button>

        <button
          id="tool-pencil"
          onClick={() => {
            setCurrentTool('pencil');
            setIsVector(true);
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
            currentTool === 'pencil' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Toonz Pencil (Fine lines)"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Pencil</span>
        </button>

        <button
          id="tool-raster"
          onClick={() => {
            setCurrentTool('raster');
            setIsVector(false);
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
            currentTool === 'raster' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Toonz Raster Brush (rasterbrush circular dab stamps)"
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Toonz Raster</span>
        </button>

        <button
          id="tool-eraser"
          onClick={() => setCurrentTool('eraser')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
            currentTool === 'eraser' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="OpenToonz Eraser"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Eraser</span>
        </button>

        <button
          id="tool-fill"
          onClick={() => setCurrentTool('fill')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
            currentTool === 'fill' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="OpenToonz Scanline Flood Fill"
        >
          <PaintBucket className="w-3.5 h-3.5" />
          <span>Fill</span>
        </button>
      </div>

      {/* Dynamic Controls: Size, Opacity, Smoothing, Pressure Gauge */}
      <div className="flex items-center gap-3">
        {/* Brush Size Slider */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-[11px] font-mono text-slate-400">Size</span>
          <input
            id="slider-size"
            type="range"
            min="1"
            max="60"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 accent-emerald-500 cursor-pointer"
          />
          <span className="w-6 text-[11px] font-mono text-slate-300">{brushSize}px</span>
        </div>

        {/* Smoothing (OpenToonz Error Tolerance) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300" title="OpenToonz StrokeGenerator error tolerance parameter">
          <span className="text-[11px] font-mono text-slate-400">Smooth</span>
          <input
            id="slider-smooth"
            type="range"
            min="0.5"
            max="15"
            step="0.5"
            value={smoothError}
            onChange={(e) => setSmoothError(Number(e.target.value))}
            className="w-16 accent-blue-500 cursor-pointer"
          />
          <span className="w-6 text-[11px] font-mono text-slate-300">{smoothError}</span>
        </div>

        {/* Live Pressure Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800" title="Live stylus / pointer pressure input">
          <span className="text-[10px] uppercase font-mono text-slate-400">Press</span>
          <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-75"
              style={{ width: `${Math.round(currentPressure * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-emerald-400 w-7 text-right">
            {(currentPressure * 100).toFixed(0)}%
          </span>
        </div>

        {/* Color Palette & Custom Picker */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            {COLOR_SWATCHES.slice(0, 5).map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-4 h-4 rounded-full border cursor-pointer transition ${
                  brushColor.toLowerCase() === color.toLowerCase() ? 'scale-125 border-white' : 'border-slate-700'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
              title="Custom color picker"
            />
          </div>
        </div>

        {/* TStroke Control Points View Toggle */}
        <button
          id="btn-toggle-points"
          onClick={() => setShowControlPoints(!showControlPoints)}
          className={`p-1.5 rounded text-xs transition cursor-pointer ${
            showControlPoints ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
          title="Toggle OpenToonz TStroke control points visualization"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            id="btn-undo"
            disabled={!canUndo}
            onClick={onUndo}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              canUndo ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'opacity-40 cursor-not-allowed text-slate-500'
            }`}
            title="Undo stroke"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-redo"
            disabled={!canRedo}
            onClick={onRedo}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              canRedo ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'opacity-40 cursor-not-allowed text-slate-500'
            }`}
            title="Redo stroke"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="p-1 hover:text-white text-slate-400"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 text-slate-300">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="p-1 hover:text-white text-slate-400"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="p-1 hover:text-white text-slate-400 ml-0.5"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Layers & Timeline Panel Toggles */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
          {onToggleLayers && (
            <button
              id="btn-toggle-layers-panel"
              onClick={onToggleLayers}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer font-medium ${
                showLayers ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
              }`}
              title={showLayers ? 'Hide Layers panel' : 'Show Layers panel'}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showLayers ? 'Hide Layers' : 'Show Layers'}</span>
            </button>
          )}

          {onToggleTimeline && (
            <button
              id="btn-toggle-timeline-panel"
              onClick={onToggleTimeline}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer font-medium ${
                showTimeline ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
              }`}
              title={showTimeline ? 'Hide Timeline panel' : 'Show Timeline panel'}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{showTimeline ? 'Hide Timeline' : 'Show Timeline'}</span>
            </button>
          )}
        </div>

        {/* Export Button */}
        <button
          id="btn-open-export"
          onClick={onOpenExport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-sm"
          title="Export Project, PNG, SVG or Frames"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
