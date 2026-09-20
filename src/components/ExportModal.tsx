import React, { useState } from 'react';
import {
  X,
  Download,
  Image,
  FileCode,
  Film,
  FileJson,
  Check
} from 'lucide-react';
import { Frame, Layer, OpenToonzStroke } from '../types';
import { exportStrokesToSvg, renderOpenToonzStroke } from '../engine/openToonzEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  frames: Frame[];
  layers: Layer[];
  currentFrameIndex: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  frames,
  layers,
  currentFrameIndex,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const currentFrame = frames[currentFrameIndex];
  const allCurrentStrokes: OpenToonzStroke[] = layers
    .filter((l) => l.visible)
    .flatMap((l) => currentFrame.strokesByLayer[l.id] || []);

  const handleExportPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const layer of layers) {
      if (!layer.visible) continue;
      const strokes = currentFrame.strokesByLayer[layer.id] || [];
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      for (const stroke of strokes) {
        renderOpenToonzStroke(ctx, stroke, false);
      }
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `project_canvas_frame_${currentFrame.frameNumber}.png`;
    a.click();
  };

  const handleExportSvg = () => {
    const svgStr = exportStrokesToSvg(allCurrentStrokes, 1280, 720);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_canvas_frame_${currentFrame.frameNumber}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const projectData = {
      version: '29.0-opentoonz',
      engine: 'OpenToonz v1.8.0',
      commit: '065cc1404ba43019b22a2577d529134c3e01931b',
      exportedAt: new Date().toISOString(),
      layers,
      frames,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_canvas_animation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Export Artwork & Animation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3">
          {/* PNG Option */}
          <button
            onClick={handleExportPng}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/70 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition">
                  Export PNG Image (Current Frame)
                </h3>
                <p className="text-xs text-slate-400">High-resolution 1280×720 bitmap snapshot</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
          </button>

          {/* SVG Option */}
          <button
            onClick={handleExportSvg}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/70 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">
                  Export SVG Vector Path (TStroke)
                </h3>
                <p className="text-xs text-slate-400">OpenToonz quad bezier vector curves</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
          </button>

          {/* Project JSON Option */}
          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/70 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition">
                  Export Project JSON
                </h3>
                <p className="text-xs text-slate-400">Complete multi-layer animation data with metadata</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
