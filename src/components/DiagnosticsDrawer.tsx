import React from 'react';
import { 
  X, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode, 
  HelpCircle,
  Copy,
  Check,
  GitBranch
} from 'lucide-react';
import { DiagnosticError } from '../types';
import { PLATFORM_CONFIGS } from '../services/platformData';

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  errors: DiagnosticError[];
  onApplyPatch: (errorId: string) => void;
  onRejectPatch: (errorId: string) => void;
  isApplyingPatch?: boolean;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  errors,
  onApplyPatch,
  onRejectPatch,
  isApplyingPatch,
}) => {
  const [copiedDiffId, setCopiedDiffId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyDiff = (id: string, diff: string) => {
    navigator.clipboard.writeText(diff);
    setCopiedDiffId(id);
    setTimeout(() => setCopiedDiffId(null), 2000);
  };

  const getCategoryBadge = (category: DiagnosticError['category']) => {
    switch (category) {
      case 'syntax_error':
        return <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">Syntax / Code Error</span>;
      case 'missing_dependency':
        return <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold">Missing Dependency</span>;
      case 'config_error':
        return <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">Config / Build Tool</span>;
      case 'signing_error':
        return <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">Code Signing</span>;
      case 'platform_specific':
        return <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">Platform Matrix</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Diagnostics & Auto-Fix Engine
                </h3>
                <span className="text-[10px] sm:text-xs font-mono px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold shrink-0">
                  {errors.length} {errors.length === 1 ? 'Issue' : 'Issues'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Compiler error analysis, root causes, and patch diffs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {errors.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clean Build Pipeline</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                Zero compiler errors or dependency failures detected. All platform invariants verified.
              </p>
            </div>
          ) : (
            errors.map((err) => (
              <div
                key={err.id}
                className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                {/* Error Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
                        {PLATFORM_CONFIGS[err.platform]?.label || err.platform}
                      </span>
                      {getCategoryBadge(err.category)}
                      {err.attempts > 0 && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          Attempt {err.attempts}/3
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>{err.file}{err.line ? `:${err.line}` : ''}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {err.status === 'auto_fixed' ? (
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Auto-Patched
                      </span>
                    ) : err.status === 'pending_approval' ? (
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Pending Approval
                      </span>
                    ) : err.status === 'rejected' ? (
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-semibold">
                        Patch Rejected
                      </span>
                    ) : (
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold">
                        Error Detected
                      </span>
                    )}
                  </div>
                </div>

                {/* Compiler Output Trace */}
                {err.errorCode && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] font-mono text-rose-700 dark:text-rose-300 leading-relaxed overflow-x-auto">
                    {err.errorCode}
                  </div>
                )}

                {/* Plain English Explanation */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Failure Summary:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{err.message}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Root Cause:</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{err.rootCause}</p>
                  </div>
                </div>

                {/* Proposed Patch Unified Diff */}
                {err.proposedDiff && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                        Proposed Unified Diff Patch
                      </span>
                      <button
                        onClick={() => handleCopyDiff(err.id, err.proposedDiff)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        {copiedDiffId === err.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Diff</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] overflow-x-auto p-3 text-[11px] font-mono leading-relaxed max-h-56">
                      {err.proposedDiff.split('\n').map((line, idx) => {
                        let color = 'text-slate-800 dark:text-slate-300';
                        let bg = 'transparent';
                        if (line.startsWith('+') && !line.startsWith('+++')) {
                          color = 'text-emerald-600 dark:text-emerald-400 font-bold';
                          bg = 'bg-emerald-50 dark:bg-emerald-950/20';
                        } else if (line.startsWith('-') && !line.startsWith('---')) {
                          color = 'text-rose-600 dark:text-rose-400';
                          bg = 'bg-rose-50 dark:bg-rose-950/20';
                        } else if (line.startsWith('@@')) {
                          color = 'text-amber-600 dark:text-amber-400 font-bold';
                        }

                        return (
                          <div key={idx} className={`${bg} ${color} px-1.5 rounded`}>
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manual instructions if manual_required */}
                {err.manualInstructions && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Manual Remedy Guide
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {err.manualInstructions}
                    </p>
                  </div>
                )}

                {/* Action buttons if pending approval */}
                {err.status === 'pending_approval' && (
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => onRejectPatch(err.id)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                    >
                      Reject Patch
                    </button>
                    <button
                      onClick={() => onApplyPatch(err.id)}
                      disabled={isApplyingPatch}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-blue-600/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Patch & Retry Build</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs text-slate-500">
          <span>Max retry limit: 3 iterations per failure class</span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-full transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
