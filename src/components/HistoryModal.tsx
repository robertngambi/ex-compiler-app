import React, { useState } from 'react';
import { 
  X, 
  History, 
  Download, 
  Smartphone, 
  Monitor, 
  Search, 
  Trash2, 
  Check, 
  Copy, 
  FileArchive, 
  PackageCheck,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  ActivityRecord, 
  SerializedArtifact, 
  clearAllActivities, 
  deleteActivityRecord, 
  formatFriendlyDate, 
  redownloadActivityZip, 
  redownloadArtifact 
} from '../services/activityHistory';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityRecord[];
  onRefreshActivities: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  activities,
  onRefreshActivities,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    const matchesSearch = 
      act.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.artifacts.some(a => a.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDownloadSingle = async (art: SerializedArtifact, projectName: string) => {
    try {
      setDownloadingId(art.id);
      await redownloadArtifact(art, projectName);
    } catch (err) {
      console.error('Failed to download artifact:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
    }
  };

  const handleDownloadZip = async (act: ActivityRecord) => {
    try {
      setDownloadingId(`zip-${act.id}`);
      await redownloadActivityZip(act);
    } catch (err) {
      console.error('Failed to download zip:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const handleCopyChecksum = (checksum: string) => {
    navigator.clipboard.writeText(checksum);
    setCopiedChecksum(checksum);
    setTimeout(() => setCopiedChecksum(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteActivityRecord(id);
    onRefreshActivities();
  };

  const handleClearAll = () => {
    clearAllActivities();
    onRefreshActivities();
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold truncate">Activities & History Archive</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                  {activities.length} runs
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Access past worked sessions, examine generated packages, and redownload anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activities.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-full border border-rose-200 dark:border-rose-900/60">
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 px-2">Clear all?</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Clear all stored activity history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Archive</span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, package, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-center">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Runs
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('mobile')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('desktop')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'desktop'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>
        </div>

        {/* Scrollable Activities Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileArchive className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchTerm || selectedCategory !== 'all' ? 'No matching activities found' : 'No past compilation runs yet'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try clearing your search term or switching the category filter above.'
                  : 'Your completed compilation builds and generated output artifacts will automatically appear here for instant re-download.'}
              </p>
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Session Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* App Icon preview or category icon */}
                    <div className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {act.customIconDataUrl ? (
                        <img 
                          src={act.customIconDataUrl} 
                          alt={act.projectName} 
                          className="w-full h-full object-contain"
                        />
                      ) : act.category === 'mobile' ? (
                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {act.projectName}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {act.category}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {act.buildProfile}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatFriendlyDate(act.isoDate)}
                        </span>
                        <span>·</span>
                        <span>{act.artifacts.length} package{act.artifacts.length === 1 ? '' : 's'} compiled</span>
                        <span>·</span>
                        <span className="capitalize">{act.sourceType} project</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this run */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDownloadZip(act)}
                      disabled={downloadingId === `zip-${act.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {downloadingId === `zip-${act.id}` ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Zipping...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download All (ZIP)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(act.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove activity record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Artifacts Grid for this Activity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {act.artifacts.map((art) => (
                    <div
                      key={art.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between gap-2.5 hover:border-blue-500/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            {art.type.toUpperCase()}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold">
                            {art.sizeMb.toFixed(1)} MB
                          </span>
                        </div>
                        
                        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate" title={art.filename}>
                          {art.filename}
                        </div>
                        
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span className="truncate">{art.platformName}</span>
                          {art.signed && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                              <PackageCheck className="w-3 h-3" /> Signed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Download & Checksum copy */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyChecksum(art.checksum)}
                          className="text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                          title="Copy SHA256 checksum"
                        >
                          {copiedChecksum === art.checksum ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Checksum</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(art, act.projectName)}
                          disabled={downloadingId === art.id}
                          className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 bg-blue-50 dark:bg-blue-950/60 rounded-full transition-all cursor-pointer disabled:opacity-50"
                        >
                          {downloadingId === art.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span>Prep...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Artifacts are permanently preserved in your local session cache.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
