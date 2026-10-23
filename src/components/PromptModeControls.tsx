import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Play, 
  Shield, 
  Wrench
} from 'lucide-react';
import { parsePrompt } from '../services/promptParser';
import { BuildOptions, PromptParseResult } from '../types';
import { PLATFORM_CONFIGS } from '../services/platformData';

interface PromptModeControlsProps {
  onStartBuildWithParsedOptions: (options: BuildOptions) => void;
  isBuilding: boolean;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  "Build me an Android APK and iOS IPA in release mode, fix any Kotlin compile errors, and give me download links.",
  "Package all desktop targets (Windows EXE, macOS DMG, Linux AppImage) in release mode with auto-fixing enabled.",
  "Build Android APK and AAB with debug profile, no auto-fix, and resolve missing dependencies.",
];

export const PromptModeControls: React.FC<PromptModeControlsProps> = ({
  onStartBuildWithParsedOptions,
  isBuilding,
  disabled,
}) => {
  const [promptText, setPromptText] = useState(
    "Build me an Android APK and iOS IPA in release mode, fix any Kotlin compile errors, and give me download links."
  );
  const [parseResult, setParseResult] = useState<PromptParseResult>(() => 
    parsePrompt("Build me an Android APK and iOS IPA in release mode, fix any Kotlin compile errors, and give me download links.")
  );

  useEffect(() => {
    if (promptText.trim()) {
      const res = parsePrompt(promptText);
      setParseResult(res);
    }
  }, [promptText]);

  const handleRun = () => {
    onStartBuildWithParsedOptions({
      selectedPlatforms: parseResult.platforms,
      autoFixErrors: parseResult.autoFix,
      installMissingDeps: parseResult.installDeps,
      signBuilds: parseResult.sign,
      buildProfile: parseResult.profile,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>Natural Language Directive</span>
        </label>

        <div className="relative">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            placeholder="Type your build directives..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono resize-none shadow-sm"
          />
        </div>

        {/* Suggestion prompt tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SAMPLE_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPromptText(p)}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-left truncate max-w-md cursor-pointer"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Parsed Blueprint Box */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Parsed Build Directive</h5>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
            Validated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3.5 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1 font-bold">Target Matrix:</span>
            <div className="flex flex-wrap gap-1">
              {parseResult.platforms.map((p) => (
                <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-blue-300 border border-slate-300 dark:border-slate-700 font-semibold">
                  {PLATFORM_CONFIGS[p]?.label || p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1 font-bold">Profile:</span>
            <span className="font-mono text-xs text-slate-800 dark:text-white capitalize px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
              {parseResult.profile}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1 font-bold">Auto-Patch:</span>
            <span className={`text-xs font-semibold flex items-center gap-1 ${parseResult.autoFix ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
              <Wrench className="w-3.5 h-3.5" />
              {parseResult.autoFix ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1 font-bold">Signing:</span>
            <span className={`text-xs font-semibold flex items-center gap-1 ${parseResult.sign ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
              <Shield className="w-3.5 h-3.5" />
              {parseResult.sign ? 'Signed' : 'Unsigned'}
            </span>
          </div>
        </div>
      </div>

      {/* START BUILD CTA in Blue */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRun}
          disabled={disabled || parseResult.platforms.length === 0 || isBuilding}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isBuilding ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>BUILDING...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START BUILD</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
