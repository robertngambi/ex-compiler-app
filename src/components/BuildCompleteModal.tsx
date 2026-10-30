import React from 'react';
import { 
  CheckCircle2, 
  Archive, 
  Download, 
  History, 
  Smartphone, 
  Monitor, 
  PackageCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { Artifact, PlatformId } from '../types';

interface BuildCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => Promise<void>;
  isPackagingZip: boolean;
  projectName: string;
  category: 'mobile' | 'desktop';
  buildProfile: string;
  artifacts: Artifact[];
  customIconDataUrl?: string;
  onOpenRecents: () => void;
}

export const BuildCompleteModal: React.FC<BuildCompleteModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
  isPackagingZip,
  projectName,
  category,
  buildProfile,
  artifacts,
  customIconDataUrl,
  onOpenRecents,
}) => {
  if (!isOpen || artifacts.length === 0) return null;

  const totalSizeMb = artifacts.reduce((acc, a) => acc + a.sizeMb, 0).toFixed(1);

  const handleDownloadAndDismiss = async () => {
    try {
      await onDownloadZip();
    } finally {
      onClose();
    }
  };

  const getPlatformIcon = (platform: PlatformId) => {
    if (platform.includes('android') || platform === 'ios-ipa') {
      return <Smartphone className="w-4 h-4 text-emerald-500" />;
    }
    return <Monitor className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Build Complete!
                </h3>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All generated output files are compiled and packed into a release ZIP.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Project Details Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {customIconDataUrl ? (
                  <img src={customIconDataUrl} alt={projectName} className="w-full h-full object-contain" />
                ) : category === 'mobile' ? (
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Monitor className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {projectName}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="capitalize">{category} outputs</span>
                  <span>·</span>
                  <span className="uppercase font-mono font-semibold">{buildProfile}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                {totalSizeMb} MB
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {artifacts.length} file{artifacts.length === 1 ? '' : 's'} packed
              </span>
            </div>
          </div>

          {/* Packed Files Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              Files inside this ZIP archive:
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
              {artifacts.map((art) => (
                <div 
                  key={art.id} 
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-[11px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getPlatformIcon(art.platform)}
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {art.filename}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-slate-500">
                    {art.signed && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Signed
                      </span>
                    )}
                    <span>{art.sizeMb.toFixed(1)} MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Installation Tip */}
          {category === 'mobile' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-[11px] text-emerald-900 dark:text-emerald-300">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0 leading-relaxed">
                <span>
                  <strong>Android Mobile Installation:</strong> Real compiled APK with valid binary manifest, Dalvik bytecode, and signature. When installing, if Android shows <em>&quot;Install unknown apps&quot;</em> or Play Protect warning for self-signed packages, tap <strong>&quot;Install anyway&quot;</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Activities / Recents Reminder */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-300">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0 leading-relaxed">
              <span>
                All generated files remain safely preserved in your <strong>Activities (&quot;Recents&quot;)</strong> folder, where you can re-download them anytime.
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions: Cancel on the LEFT, Download a ZIP file on the RIGHT */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-3">
          {/* Cancel Button on the LEFT */}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold rounded-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer select-none"
          >
            Cancel
          </button>

          {/* Download a ZIP file Button on the RIGHT */}
          <button
            type="button"
            onClick={handleDownloadAndDismiss}
            disabled={isPackagingZip}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 select-none"
          >
            {isPackagingZip ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Packing ZIP...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Download a ZIP file</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
