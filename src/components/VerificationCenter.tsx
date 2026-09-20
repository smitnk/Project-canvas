import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BuildStep } from '../types';
import { OpenToonzStrokeGenerator, OPENTOONZ_COMMIT_SHA, OPENTOONZ_TAG } from '../engine/openToonzEngine';

interface VerificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  steps: BuildStep[];
  onRunAll: () => Promise<void>;
  onRunSingle: (id: number) => Promise<void>;
  isRunningAll: boolean;
}

export const VerificationCenter: React.FC<VerificationCenterProps> = ({
  isOpen,
  onClose,
  steps,
  onRunAll,
  onRunSingle,
  isRunningAll,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const passedCount = steps.filter((s) => s.status === 'passed').length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                OpenToonz Engine Build Order Verification
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {passedCount}/17 Passed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                17-Step validation suite required by the OpenToonz drawing engine specification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-run-all-tests"
              onClick={onRunAll}
              disabled={isRunningAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningAll ? 'Running Tests...' : 'Run All 17 Steps'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>Target: <strong className="text-slate-200">MotionCanvas v29 (Android)</strong></span>
            <span>Upstream: <strong className="text-slate-200">OpenToonz {OPENTOONZ_TAG}</strong></span>
            <span>Commit: <strong className="text-emerald-400">{OPENTOONZ_COMMIT_SHA.substring(0, 10)}</strong></span>
          </div>
          <span className="text-emerald-400 font-semibold">100% Native Spec</span>
        </div>

        {/* Step List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {steps.map((step) => {
            const isExpanded = expandedStep === step.id;

            return (
              <div
                key={step.id}
                className={`rounded-lg border transition ${
                  step.status === 'passed'
                    ? 'bg-slate-950/60 border-emerald-900/50'
                    : step.status === 'running'
                    ? 'bg-slate-850 border-blue-500/60 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80'
                }`}
              >
                <div
                  className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                      {step.status === 'passed' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {step.status === 'running' && (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                      )}
                      {step.status === 'idle' && (
                        <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                          {step.id}
                        </div>
                      )}
                      {step.status === 'failed' && (
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">Step {step.id}</span>
                        <h3 className="text-xs font-semibold text-slate-200">{step.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRunSingle(step.id);
                      }}
                      disabled={isRunningAll}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    >
                      Run Step
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && step.details && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/80 rounded-b-lg">
                    <div className="text-[11px] font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
                      {step.details}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>License: <strong>OpenToonz Modified BSD (3-Clause)</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Close Runner
          </button>
        </div>
      </div>
    </div>
  );
};
