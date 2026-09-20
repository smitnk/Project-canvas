import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings2,
  Sparkles,
  Monitor,
  Palette,
  Clock,
  Film
} from 'lucide-react';

interface PresetSize {
  name: string;
  width: number;
  height: number;
  label: string;
}

const PRESET_SIZES: PresetSize[] = [
  { name: 'HD 720p', width: 1280, height: 720, label: '16:9 Standard HD' },
  { name: 'Full HD 1080p', width: 1920, height: 1080, label: '16:9 Broadcast Quality' },
  { name: 'Square 1:1', width: 1080, height: 1080, label: 'Social & Loopable' },
  { name: 'Portrait 9:16', width: 1080, height: 1920, label: 'Vertical Mobile Reel' },
  { name: 'Classic 4:3', width: 800, height: 600, label: 'Traditional Animation' },
];

const FPS_OPTIONS = [12, 24, 30, 60];

const BG_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Soft Cream', hex: '#f8fafc' },
  { name: 'Studio Slate', hex: '#0f172a' },
  { name: 'Film Gray', hex: '#1e293b' },
  { name: 'Transparent Grid', hex: 'transparent' },
];

interface CreateProjectScreenProps {
  onBack: () => void;
  onCreate: (project: {
    name: string;
    width: number;
    height: number;
    fps: number;
    backgroundColor: string;
  }) => void;
}

export const CreateProjectScreen: React.FC<CreateProjectScreenProps> = ({
  onBack,
  onCreate,
}) => {
  const [name, setName] = useState<string>('Untitled Animation');
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(720);
  const [fps, setFps] = useState<number>(24);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  const handleSelectPreset = (preset: PresetSize) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      width: Math.max(100, Math.min(4096, width)),
      height: Math.max(100, Math.min(4096, height)),
      fps,
      backgroundColor,
    });
  };

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-y-auto bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button
          id="btn-back-home"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-emerald-400" />
          <h1 className="text-sm font-bold text-white tracking-tight">Project Setup</h1>
        </div>

        <div className="w-24" /> {/* Balanced Spacer */}
      </header>

      {/* Main Setup Form Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Configure New Project</h2>
              <p className="text-xs text-slate-400">Specify canvas dimensions, frame rate, and initial color</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="project-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Project Name
              </label>
              <input
                id="project-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="My Animation"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Canvas Dimension Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                {PRESET_SIZES.map((preset) => {
                  const isSelected = width === preset.width && height === preset.height;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.name}</div>
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold">{preset.width} × {preset.height}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{preset.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Width & Height inputs */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label htmlFor="input-custom-width" className="block text-[11px] font-mono text-slate-400 mb-1">
                    Custom Width (px)
                  </label>
                  <input
                    id="input-custom-width"
                    type="number"
                    min="100"
                    max="4096"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="input-custom-height" className="block text-[11px] font-mono text-slate-400 mb-1">
                    Custom Height (px)
                  </label>
                  <input
                    id="input-custom-height"
                    type="number"
                    min="100"
                    max="4096"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Frame Rate (FPS) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Playback Frame Rate (FPS)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {FPS_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFps(val)}
                    className={`py-2.5 rounded-xl border text-center font-mono text-xs font-bold transition cursor-pointer ${
                      fps === val
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {val} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Initial Canvas Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {BG_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setBackgroundColor(col.hex)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition cursor-pointer ${
                      backgroundColor === col.hex
                        ? 'border-emerald-500 bg-slate-950 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-slate-600 inline-block shadow-inner"
                      style={{ backgroundColor: col.hex === 'transparent' ? '#334155' : col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit & Cancel Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-create-and-open"
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create & Open Project</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
