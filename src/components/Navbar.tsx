import React from 'react';
import { 
  Hammer, 
  KeyRound, 
  HelpCircle
} from 'lucide-react';
import { ForgeSettings } from '../types';

interface NavbarProps {
  settings: ForgeSettings;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onOpenDocs,
}) => {
  const secretsConfigured = settings.androidKeystoreUploaded || settings.appleP8Configured || settings.githubPatConfigured;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Hammer className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight ex-compiler-title">
              Ex-Compiler
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 font-semibold">
              Multi-Platform
            </span>
          </div>
        </div>

        {/* Right Actions: Output Formats & Docs Help (?) and Settings & Keys */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDocs}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition-colors cursor-pointer"
            title="Documentation, Permalinks & Output Formats Guide"
            aria-label="Output Guide & Documentation"
          >
            <HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </button>

          {/* Signing & Settings Key button */}
          <button
            onClick={onOpenSettings}
            className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              secretsConfigured 
                ? 'bg-blue-600/15 text-blue-500 dark:text-blue-400 border border-blue-500/40 hover:bg-blue-600/25 shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
            title="Settings & Secrets Vault"
            aria-label="Settings & Secrets Vault"
          >
            <KeyRound className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            {secretsConfigured && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
