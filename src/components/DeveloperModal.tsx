import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Smartphone, 
  Apple, 
  Github, 
  Webhook, 
  Upload, 
  HelpCircle
} from 'lucide-react';
import { ForgeSettings } from '../types';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ForgeSettings;
  onSaveSettings: (settings: ForgeSettings) => void;
  onOpenPinGuide: () => void;
  theme: 'dark' | 'light';
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenPinGuide,
  theme,
}) => {
  const [form, setForm] = useState<ForgeSettings>({ ...settings });
  const [testingGithub, setTestingGithub] = useState(false);
  const [githubStatus, setGithubStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  const handleTestGithub = () => {
    setTestingGithub(true);
    setGithubStatus(null);
    setTimeout(() => {
      setTestingGithub(false);
      if (form.githubPatConfigured) {
        setGithubStatus('Verified: Connected to GitHub API.');
      } else {
        setGithubStatus('Please configure GitHub PAT first.');
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40' 
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Developer Configuration & Keys
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Android Keystore */}
          <div className={`space-y-2 p-4 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Android Keystore</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <input
                type="text"
                value={form.androidKeyAlias}
                onChange={(e) => setForm({ ...form, androidKeyAlias: e.target.value })}
                placeholder="Key Alias"
                className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, androidKeystoreUploaded: !form.androidKeystoreUploaded, androidKeystoreName: 'app-release.keystore' })}
                className={`py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  form.androidKeystoreUploaded 
                    ? 'border-blue-500/40 bg-blue-600/10 text-blue-600 dark:text-blue-300 font-bold' 
                    : isLight 
                      ? 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100' 
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{form.androidKeystoreUploaded ? 'app-release.keystore' : 'Upload Keystore'}</span>
              </button>
            </div>
          </div>

          {/* iOS Apple Developer */}
          <div className={`space-y-2 p-4 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <Apple className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Apple Developer (.p8)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <input
                type="text"
                maxLength={10}
                value={form.appleTeamId}
                onChange={(e) => setForm({ ...form, appleTeamId: e.target.value.toUpperCase() })}
                placeholder="Team ID (10 chars)"
                className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, appleP8Configured: !form.appleP8Configured, appleKeyId: 'AuthKey_9X28.p8' })}
                className={`py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  form.appleP8Configured
                    ? 'border-blue-500/40 bg-blue-600/10 text-blue-600 dark:text-blue-300 font-bold'
                    : isLight 
                      ? 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100' 
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{form.appleP8Configured ? 'AuthKey_9X28.p8' : 'Upload .p8 Key'}</span>
              </button>
            </div>
          </div>

          {/* GitHub Actions PAT */}
          <div className={`space-y-2 p-4 rounded-xl border text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">GitHub Actions Matrix PAT</span>
              </div>
              <button
                type="button"
                onClick={handleTestGithub}
                disabled={testingGithub}
                className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
              >
                {testingGithub ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <input
              type="text"
              value={form.githubRepoTarget}
              onChange={(e) => setForm({ ...form, githubRepoTarget: e.target.value })}
              placeholder="Target Repository (owner/repo)"
              className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />

            {githubStatus && (
              <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                {githubStatus}
              </p>
            )}
          </div>

          {/* Webhook */}
          <div className={`space-y-1.5 p-4 rounded-xl border text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Build Webhook Endpoint</span>
            </div>
            <input
              type="text"
              value={form.customWebhookUrl}
              onChange={(e) => setForm({ ...form, customWebhookUrl: e.target.value })}
              placeholder="https://api.mycompany.com/webhook"
              className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>

          {/* Bottom Bar: Guide button on how to configure pins + Save/Close buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}>
            {/* Guide page button on the bottom on how to configure pins */}
            <button
              type="button"
              onClick={onOpenPinGuide}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to configure PINs & Keys</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                  isLight 
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Close
              </button>
              <button
                type="submit"
                className="px-7 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors cursor-pointer shadow-md shadow-blue-600/30"
              >
                Save
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
