import React, { useState } from 'react';
import { 
  Download, 
  Archive, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Smartphone, 
  Store, 
  Apple, 
  Monitor, 
  PackageCheck, 
  Laptop, 
  Terminal,
  FileCheck2
} from 'lucide-react';
import { Artifact, PlatformId } from '../types';

interface ResultsPanelProps {
  artifacts: Artifact[];
  projectName: string;
  onDownloadAll: () => void;
  isPackagingZip: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  artifacts,
  projectName,
  onDownloadAll,
  isPackagingZip,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const handleCopyLink = (artifact: Artifact) => {
    navigator.clipboard.writeText(artifact.permalink);
    setCopiedId(artifact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSingle = (artifact: Artifact) => {
    if (artifact.downloadUrl) {
      const a = document.createElement('a');
      a.href = artifact.downloadUrl;
      a.download = artifact.filename;
      a.click();
      setDownloadedId(artifact.id);
      setTimeout(() => setDownloadedId(null), 2000);
    }
  };

  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'android-apk':
        return <Smartphone className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'android-aab':
        return <Store className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'ios-ipa':
        return <Apple className="w-5 h-5 text-slate-700 dark:text-slate-200" />;
      case 'windows-exe':
        return <Monitor className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'windows-msi':
        return <PackageCheck className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'macos-dmg':
        return <Laptop className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case 'linux-appimage':
        return <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <FileCheck2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  if (artifacts.length === 0) {
    return null;
  }

  const totalSizeMb = artifacts.reduce((acc, a) => acc + a.sizeMb, 0).toFixed(1);

  return (
    <div className="space-y-4 pt-2">
      {/* Header bar with Download All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Build Outputs Ready ({artifacts.length} Packages)
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Total footprint: <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{totalSizeMb} MB</span>
          </p>
        </div>

        {/* Download all as ZIP in Blue */}
        <button
          onClick={onDownloadAll}
          disabled={isPackagingZip}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {isPackagingZip ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Bundling ZIP...</span>
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              <span>Download All as ZIP</span>
            </>
          )}
        </button>
      </div>

      {/* Artifact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artifacts.map((art) => (
          <div
            key={art.id}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
          >
            <div>
              {/* Top metadata */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {getPlatformIcon(art.platform)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {art.platformName}
                    </h4>
                    <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {art.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {art.signed && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Signed
                    </span>
                  )}
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {art.buildProfile}
                  </span>
                </div>
              </div>

              {/* Filename and details */}
              <div className="space-y-1.5 mb-4">
                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80" title={art.filename}>
                  {art.filename}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Size:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{art.sizeMb} MB</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Runner:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={art.runner}>{art.runner}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Expires:
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">In 24h</span>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block truncate" title={art.checksum}>
                    {art.checksum.slice(0, 24)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Blue Download button */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <button
                onClick={() => handleDownloadSingle(art)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                {downloadedId === art.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyLink(art)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-full transition-colors cursor-pointer"
                title="Copy download permalink"
              >
                {copiedId === art.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
