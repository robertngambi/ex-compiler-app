import React from 'react';
import { 
  Hammer, 
  KeyRound, 
  HelpCircle,
  History
} from 'lucide-react';
import { ForgeSettings } from '../types';

interface NavbarProps {
  settings: ForgeSettings;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  onOpenHistory: () => void;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onOpenDocs,
  onOpenHistory,
  historyCount = 0,
}) => {
  const secretsConfigured = settings.androidKeystoreUploaded || settings.appleP8Configured || settings.githubPatConfigured;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[7px] sm:rounded-[9px] flex items-center justify-center">
              <Hammer className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-base sm:text-xl font-bold tracking-tight ex-compiler-title truncate">
              Ex-Compiler
            </span>
            <span className="hidden xs:inline-block sm:inline-block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold shrink-0">
              Multi-Platform
            </span>
          </div>
        </div>

        {/* Right Actions: Recents, Help Docs, Settings & Keys */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Recents / Activities Archive button */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer select-none"
            title="Recents & Activities Archive"
            aria-label="Recents & Activities Archive"
          >
            <History className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="hidden xs:inline sm:inline">Recents</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-mono font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Docs & Output Guide '?' button: same border outline, background, and sizing as the key button */}
          <button
            onClick={onOpenDocs}
            className="relative p-1.5 sm:p-2 rounded-full transition-all cursor-pointer flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-xs"
            title="Documentation, Permalinks & Output Formats Guide"
            aria-label="Output Guide & Documentation"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400" />
          </button>

          {/* Signing & Settings Key button */}
          <button
            onClick={onOpenSettings}
            className={`relative p-1.5 sm:p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              secretsConfigured 
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/40 hover:bg-blue-600/25 shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-xs'
            }`}
            title="Settings & Secrets Vault"
            aria-label="Settings & Secrets Vault"
          >
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400" />
            {secretsConfigured && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
