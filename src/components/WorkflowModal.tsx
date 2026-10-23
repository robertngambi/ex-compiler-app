import React, { useState } from 'react';
import { X, FileCode2, Copy, Check, Download } from 'lucide-react';
import { generateGitHubActionsWorkflow } from '../services/buildEngine';
import { BuildOptions } from '../types';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  options: BuildOptions;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  projectName,
  options,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const yamlContent = generateGitHubActionsWorkflow(projectName || 'MyApplication', options);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'release.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                .github/workflows/release.yml
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Generated CI matrix workflow for native multi-platform compilation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy YAML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* YAML Display */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#030712] font-mono text-[11.5px] leading-relaxed text-slate-800 dark:text-slate-300 select-text">
          <pre className="whitespace-pre">
            {yamlContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="font-mono">Runner Matrix: windows-latest, macos-14, ubuntu-22.04</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors cursor-pointer shadow-md shadow-blue-600/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
