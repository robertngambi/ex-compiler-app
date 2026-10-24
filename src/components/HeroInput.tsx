import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Globe, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  X,
  FileCode,
  RefreshCw
} from 'lucide-react';
import { ProjectAnalysis } from '../types';
import { SAMPLE_PRESETS, SamplePreset } from '../services/samplePresets';

interface HeroInputProps {
  analysis: ProjectAnalysis | null;
  isAnalyzing: boolean;
  onUrlSubmit: (url: string) => void;
  onFileUpload: (file: File) => void;
  onSelectPreset: (preset: SamplePreset) => void;
  onReset: () => void;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  analysis,
  isAnalyzing,
  onUrlSubmit,
  onFileUpload,
  onSelectPreset,
  onReset,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleUrlFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    if (!urlInput.trim()) {
      setUrlError('Please enter a web URL or repository');
      return;
    }
    onUrlSubmit(urlInput.trim());
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Input zone if no project loaded */}
      {!analysis ? (
        <div className="flex flex-col gap-4 sm:gap-4.5">
          
          {/* Top Box: Drag and drop app archive or project ZIP */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full relative group cursor-pointer border-2 border-dashed rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all flex flex-col items-center justify-center text-center min-h-[170px] sm:min-h-[190px] ${
              isDragging 
                ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
                : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 shadow-xs'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".zip,.apk,.ipa,.aab,application/zip"
              className="hidden" 
              onChange={handleFileInputChange}
            />
            
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:border-blue-500/40 transition-all shadow-xs">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
              Drag and drop app archive or project ZIP here
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mb-3 px-2">
              Ingest Flutter, React Native, Tauri, Electron, Kotlin, or iOS project archives (.zip, .apk, .ipa, .aab)
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-full transition-colors">
              <FileArchive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Browse Local Files</span>
            </div>
          </div>

          {/* Bottom Box: Paste hosted app URL */}
          <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Paste Hosted App URL
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Wrap any live Vercel, Netlify, web app or Git repo into installable native packages
                  </p>
                </div>
              </div>

              <form onSubmit={handleUrlFormSubmit} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://my-app.vercel.app or repository link"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-sm shadow-blue-600/25 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Inspect & Wrap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {urlError && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{urlError}</span>
                  </p>
                )}
              </form>
            </div>
          </div>

        </div>
      ) : (
        /* Project Loaded Summary Card */
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                {analysis.isHostedUrl ? (
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    {analysis.name}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold">
                    {analysis.detectedType}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                  {analysis.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Change Target</span>
              </button>
            </div>
          </div>

          {/* Files & Dependencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">Project Manifests:</span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.filesFound.slice(0, 5).map((f, i) => (
                  <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">Dependencies & Toolchain:</span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingDepsDetected.length > 0 ? (
                  analysis.missingDepsDetected.map((d, i) => (
                    <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 font-semibold">
                      + {d}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified SDK & Toolchains
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Quick Load Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Quick Test Presets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="text-left p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  {preset.category}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500 transition-colors font-medium">
                  Load →
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                {preset.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {preset.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
