import React from 'react';
import { X, KeyRound } from 'lucide-react';

interface PinGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PinGuideModal: React.FC<PinGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                How to Configure Keys & PINs
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          
          {/* Section 1: Android Keystore PIN and Password */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold">
              <span>1. Android Keystore & PIN Password</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Generate a private release keystore protected with a secure password/PIN using standard JDK <code className="font-mono text-slate-800 dark:text-slate-200">keytool</code>:
            </p>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 select-all overflow-x-auto">
              keytool -genkey -v -keystore release.keystore -alias forge-key -keyalg RSA -keysize 2048 -validity 10000
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>When prompted, set your keystore PIN / password (at least 6 characters).</li>
              <li>Provide your organization details and set the key alias password.</li>
              <li>In the Developer Configuration modal, attach <code className="font-mono text-slate-800 dark:text-slate-200">release.keystore</code> and enter the alias.</li>
            </ul>
          </div>

          {/* Section 2: Apple Developer PIN / API Key */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold">
              <span>2. Apple Developer Team ID & AuthKey PIN</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>Go to <strong className="text-slate-900 dark:text-slate-200">developer.apple.com</strong> &gt; Membership to find your 10-character Team ID (e.g. <code className="font-mono text-blue-600 dark:text-blue-300">A679Z84F3K</code>).</li>
              <li>In <strong className="text-slate-900 dark:text-slate-200">App Store Connect</strong> &gt; Users & Access &gt; Integrations &gt; Keys, generate a distribution API Key.</li>
              <li>Download the private <code className="font-mono text-slate-800 dark:text-slate-200">.p8</code> file and upload it into the Developer modal.</li>
            </ul>
          </div>

          {/* Section 3: GitHub Actions Matrix PAT */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold">
              <span>3. GitHub Personal Access Token (PAT)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              In <strong className="text-slate-900 dark:text-slate-200">GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens</strong>, generate a token with <code className="font-mono text-blue-600 dark:text-blue-300">repo</code> and <code className="font-mono text-blue-600 dark:text-blue-300">workflow</code> permissions to allow native desktop matrix builds (Windows, macOS, Linux).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
