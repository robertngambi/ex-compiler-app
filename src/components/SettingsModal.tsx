import React from 'react';
import { 
  X, 
  KeyRound, 
  Sun, 
  Moon, 
  Wrench, 
  DownloadCloud, 
  ShieldCheck,
  FileCode2,
  Server,
  CheckCircle2
} from 'lucide-react';
import { BuildOptions } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildOptions: BuildOptions;
  onOptionsChange: (options: BuildOptions) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  onOpenDeveloperModal: () => void;
  onOpenWorkflow: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  buildOptions,
  onOptionsChange,
  theme,
  onThemeChange,
  onOpenDeveloperModal,
  onOpenWorkflow,
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-lg border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40' 
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        
        {/* Header with Key symbol */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight">
                Settings & Environment
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight 
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          
          {/* Appearance & Background: Dark Mode or Light Mode */}
          <div className={`space-y-2 pb-3 sm:pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Appearance
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                    : isLight 
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                    : isLight 
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Runners List & CI Workflow (Moved from Header) */}
          <div className={`space-y-2.5 pb-3 sm:pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-500" />
                <span>Build Runners & Matrix</span>
              </label>
              
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWorkflow();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                title="Inspect generated release.yml GitHub Actions workflow"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>CI Workflow</span>
              </button>
            </div>

            <div className="space-y-2">
              {/* Docker Runner */}
              <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200 truncate">
                      Docker Container (Android)
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                      Ubuntu 22.04 · Android SDK 34 · OpenJDK 17
                    </span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Ready
                </span>
              </div>

              {/* MacStadium Runner */}
              <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200 truncate">
                      MacStadium Host (iOS)
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                      macOS Sonoma · Xcode 15.4 · Fastlane
                    </span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Ready
                </span>
              </div>

              {/* GitHub Matrix Runner */}
              <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200 truncate">
                      GitHub Matrix (Desktop)
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                      windows-latest · macos-14 · ubuntu-22.04
                    </span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Build Options & Automation */}
          <div className={`space-y-2.5 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Build Options
            </label>

            <div className={`space-y-3 p-3.5 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              
              {/* Auto-fix errors */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto-Fix Errors</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...buildOptions, autoFixErrors: !buildOptions.autoFixErrors })}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    buildOptions.autoFixErrors ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-800'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 absolute top-0.5 transition-transform ${
                    buildOptions.autoFixErrors ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Install missing dependencies */}
              <div className={`flex items-center justify-between gap-3 pt-2 border-t ${
                isLight ? 'border-slate-200' : 'border-slate-800/60'
              }`}>
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Install Dependencies</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...buildOptions, installMissingDeps: !buildOptions.installMissingDeps })}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    buildOptions.installMissingDeps ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-800'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 absolute top-0.5 transition-transform ${
                    buildOptions.installMissingDeps ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Sign Builds */}
              <div className={`flex items-center justify-between gap-3 pt-2 border-t ${
                isLight ? 'border-slate-200' : 'border-slate-800/60'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sign Builds</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...buildOptions, signBuilds: !buildOptions.signBuilds })}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    buildOptions.signBuilds ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-800'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 absolute top-0.5 transition-transform ${
                    buildOptions.signBuilds ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Build Profile */}
              <div className={`flex items-center justify-between gap-3 pt-2 border-t ${
                isLight ? 'border-slate-200' : 'border-slate-800/60'
              }`}>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Profile</span>
                <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ ...buildOptions, buildProfile: 'release' })}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      buildOptions.buildProfile === 'release'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Release
                  </button>
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ ...buildOptions, buildProfile: 'debug' })}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      buildOptions.buildProfile === 'debug'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Debug
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 'Continue as developer' button: 100% rounded corners, blue background, named ONLY 'Continue as developer' */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeveloperModal();
              }}
              className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/30 cursor-pointer text-center"
            >
              Continue as developer
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex justify-end ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isLight 
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
