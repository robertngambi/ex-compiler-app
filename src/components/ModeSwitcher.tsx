import React from 'react';
import { Sliders, MessageSquareCode } from 'lucide-react';

interface ModeSwitcherProps {
  mode: 'simple' | 'prompt';
  onChange: (mode: 'simple' | 'prompt') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-xs">
        <button
          onClick={() => onChange('simple')}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            mode === 'simple'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simple Mode</span>
        </button>

        <button
          onClick={() => onChange('prompt')}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            mode === 'prompt'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquareCode className="w-3.5 h-3.5" />
          <span>Prompt Mode</span>
        </button>
      </div>
    </div>
  );
};
