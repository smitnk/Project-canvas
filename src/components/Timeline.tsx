import React from 'react';
import {
  Play,
  Pause,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { Frame } from '../types';

interface TimelineProps {
  frames: Frame[];
  currentFrameIndex: number;
  setCurrentFrameIndex: (idx: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: () => void;
  showOnionSkin: boolean;
  setShowOnionSkin: (show: boolean) => void;
  onionSkinPrev: number;
  setOnionSkinPrev: (n: number) => void;
  onionSkinNext: number;
  setOnionSkinNext: (n: number) => void;
  onClose?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  isPlaying,
  setIsPlaying,
  fps,
  setFps,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  showOnionSkin,
  setShowOnionSkin,
  onionSkinPrev,
  setOnionSkinPrev,
  onionSkinNext,
  setOnionSkinNext,
  onClose,
}) => {
  return (
    <div className="bg-slate-900 border-t border-slate-800 text-slate-200 px-4 py-2 flex flex-col gap-2 shadow-inner select-none z-20">
      {/* Top Controls: Playback, Frame Management & Onion Skin Settings */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer shadow-sm ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
            disabled={currentFrameIndex === 0}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-100 min-w-16 text-center">
            {currentFrameIndex + 1} / {frames.length}
          </span>

          <button
            onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}
            disabled={currentFrameIndex === frames.length - 1}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Frame"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* FPS Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 ml-2">
            <span className="text-[11px] font-mono text-slate-400">FPS</span>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="bg-transparent text-xs text-slate-200 border-none outline-none font-mono cursor-pointer"
            >
              <option value="12" className="bg-slate-900 text-white">12</option>
              <option value="24" className="bg-slate-900 text-white">24</option>
              <option value="30" className="bg-slate-900 text-white">30</option>
              <option value="60" className="bg-slate-900 text-white">60</option>
            </select>
          </div>
        </div>

        {/* Frame Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-add-frame"
            onClick={onAddFrame}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Add blank frame"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Frame</span>
          </button>

          <button
            id="btn-duplicate-frame"
            onClick={onDuplicateFrame}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Duplicate current frame"
          >
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>Duplicate</span>
          </button>

          <button
            id="btn-delete-frame"
            onClick={onDeleteFrame}
            disabled={frames.length <= 1}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium border border-slate-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete current frame"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Onion Skin Controls & Close Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-300">
              <input
                id="checkbox-onion-skin"
                type="checkbox"
                checked={showOnionSkin}
                onChange={(e) => setShowOnionSkin(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
              <span className={showOnionSkin ? 'text-emerald-400' : 'text-slate-400'}>Onion Skin</span>
            </label>

            {showOnionSkin && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="text-red-400 font-semibold" title="Previous frames tint">Prev:</span>
                <select
                  value={onionSkinPrev}
                  onChange={(e) => setOnionSkinPrev(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-1 text-slate-200"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>

                <span className="text-blue-400 font-semibold" title="Next frames tint">Next:</span>
                <select
                  value={onionSkinNext}
                  onChange={(e) => setOnionSkinNext(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-1 text-slate-200"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Hide timeline"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Frame Strip */}
      <div className="flex items-center gap-1 overflow-x-auto py-1.5 px-1 bg-slate-950 rounded-lg border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
        {frames.map((frame, index) => {
          const isActive = index === currentFrameIndex;
          const strokeCount = Object.values(frame.strokesByLayer).reduce((sum, list) => sum + list.length, 0);

          return (
            <button
              key={frame.id}
              onClick={() => setCurrentFrameIndex(index)}
              className={`flex-shrink-0 w-14 h-12 rounded flex flex-col items-center justify-between p-1 transition cursor-pointer border ${
                isActive
                  ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[10px] font-mono">
                <span className={isActive ? 'text-emerald-400 font-bold' : ''}>#{index + 1}</span>
                {strokeCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`${strokeCount} strokes`} />
                )}
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                {strokeCount > 0 ? `${strokeCount} strk` : 'empty'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
