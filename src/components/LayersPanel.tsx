import React from 'react';
import {
  Layers,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  MoveUp,
  MoveDown,
  X
} from 'lucide-react';
import { Layer } from '../types';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onClose?: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  setActiveLayerId,
  onAddLayer,
  onDeleteLayer,
  onToggleVisibility,
  onToggleLock,
  onChangeOpacity,
  onMoveLayer,
  onClose,
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col justify-between select-none z-10 shadow-lg">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Layers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="btn-add-layer"
            onClick={onAddLayer}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            title="Add new drawing layer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close layers panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {layers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`p-2 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                isActive
                  ? 'bg-slate-800 border-emerald-500/70 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Row 1: Name and Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      layer.isVector ? 'bg-blue-400' : 'bg-amber-400'
                    }`}
                    title={layer.isVector ? 'Vector Layer' : 'Raster Layer'}
                  />
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {layer.name}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {layer.isVector ? 'VEC' : 'RAST'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Visibility */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    className="p-1 hover:text-white text-slate-400"
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5 text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>

                  {/* Lock */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                    className="p-1 hover:text-white text-slate-400"
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
                  </button>

                  {/* Delete */}
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(layer.id);
                      }}
                      className="p-1 hover:text-rose-400 text-slate-500"
                      title="Delete layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Opacity & Reorder */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="font-mono text-[10px]">Alpha</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={layer.opacity}
                    onChange={(e) => onChangeOpacity(layer.id, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 accent-emerald-500 h-1 cursor-pointer"
                  />
                  <span className="font-mono text-[10px] w-6">{Math.round(layer.opacity * 100)}%</span>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLayer(layer.id, 'up');
                    }}
                    className="p-0.5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Layer Up"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={index === layers.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLayer(layer.id, 'down');
                    }}
                    className="p-0.5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Layer Down"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1 bg-slate-950">
        <div className="flex justify-between">
          <span>Active Pipeline:</span>
          <span className="font-mono text-emerald-400 font-semibold">TVectorImage</span>
        </div>
        <div className="flex justify-between">
          <span>Engine Model:</span>
          <span className="font-mono text-slate-300">OpenToonz v1.8.0</span>
        </div>
      </div>
    </aside>
  );
};
