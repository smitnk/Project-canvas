import React from 'react';
import {
  Film,
  Plus,
  Clock,
  Sparkles,
  Layers,
  FolderOpen,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { ProjectSummary } from '../types';

interface HomeScreenProps {
  projects: ProjectSummary[];
  onCreate: () => void;
  onOpen: (projectId: string) => void;
  onOpenVerification?: () => void;
  onOpenInspector?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  projects,
  onCreate,
  onOpen,
  onOpenVerification,
  onOpenInspector
}) => {
  return (
    <div className="flex flex-col min-h-screen w-screen overflow-y-auto bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Application Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-950">
            C29
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">MotionCanvas v29</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                OpenToonz Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Professional 2D Animation & Drawing Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenVerification && (
            <button
              id="btn-home-verification"
              onClick={onOpenVerification}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              Verification Center
            </button>
          )}
          {onOpenInspector && (
            <button
              id="btn-home-inspector"
              onClick={onOpenInspector}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              Engine C++ Inspector
            </button>
          )}
          <button
            id="btn-home-new-project"
            onClick={onCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Hero Banner with MotionCanvas v29 Branding */}
      <section className="px-8 pt-10 pb-6 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/80 rounded-2xl border border-slate-800 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Native OpenToonz StrokeGenerator & TStroke Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              MotionCanvas Studio v29
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Create frame-by-frame vector and raster animations with precision pressure-sensitive inking, multi-layer compositing, and onion skinning powered by the upstream OpenToonz C++ drawing engine.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-hero-new-project"
                onClick={onCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Animation</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <main className="px-8 py-6 max-w-6xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Recent Projects</h3>
            <span className="text-xs text-slate-400 font-mono ml-2">({projects.length})</span>
          </div>
        </div>

        {projects.length === 0 ? (
          /* Empty Project State */
          <div className="border border-dashed border-slate-800 bg-slate-900/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
              <Film className="w-7 h-7 text-slate-500" />
            </div>
            <h4 className="text-base font-bold text-slate-200 mb-1">No Projects Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Get started by creating your first animation project with custom canvas resolution and frame rates.
            </p>
            <button
              id="btn-empty-new-project"
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                onClick={() => onOpen(project.id)}
                className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-600/60 rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-150 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Canvas Preview Box */}
                  <div className="w-full h-32 rounded-xl bg-slate-950 border border-slate-800/80 mb-4 flex items-center justify-center relative overflow-hidden group-hover:border-slate-700 transition">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
                    <Film className="w-8 h-8 text-slate-600 group-hover:text-emerald-400 transition" />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300">
                      {project.width} × {project.height}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition mb-1 truncate">
                    {project.name}
                  </h4>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {project.fps} FPS
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-500" />
                      {project.frames} {project.frames === 1 ? 'Frame' : 'Frames'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">{project.updated}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-0.5 transition">
                    <span>Open Editor</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Meta */}
      <footer className="px-8 py-4 border-t border-slate-900 text-center text-xs text-slate-500 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span>MotionCanvas v29 • OpenToonz v1.8.0 Core</span>
        <span className="font-mono text-[11px] text-slate-600">Native commit 065cc1404ba43019b22a2577d529134c3e01931b</span>
      </footer>
    </div>
  );
};
