import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  Copy, 
  Check, 
  Download, 
  ArrowDown, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { BuildLog, PlatformId } from '../types';
import { PLATFORM_CONFIGS } from '../services/platformData';

interface LiveConsoleProps {
  logs: BuildLog[];
  selectedPlatforms: PlatformId[];
  isBuilding: boolean;
  onClearLogs?: () => void;
  activePlatformFilter: PlatformId | 'all';
  onPlatformFilterChange: (p: PlatformId | 'all') => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({
  logs,
  selectedPlatforms,
  isBuilding,
  onClearLogs,
  activePlatformFilter,
  onPlatformFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'cmd' | 'error' | 'fix'>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesPlatform = 
      activePlatformFilter === 'all' || 
      log.platform === activePlatformFilter ||
      log.platform === 'all' ||
      log.platform === 'orchestrator';

    const matchesSearch = 
      !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.command && log.command.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = 
      levelFilter === 'all' ||
      (levelFilter === 'cmd' && log.level === 'cmd') ||
      (levelFilter === 'error' && log.level === 'error') ||
      (levelFilter === 'fix' && log.level === 'fix');

    return matchesPlatform && matchesSearch && matchesLevel;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.command ? `CMD: ${l.command} - ` : ''}${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.platform || 'SYSTEM'}] [${l.level.toUpperCase()}] ${l.command ? `$ ${l.command}\n` : ''}${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excompiler-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelStyle = (level: BuildLog['level']) => {
    switch (level) {
      case 'cmd':
        return 'text-amber-600 dark:text-amber-300 font-semibold';
      case 'error':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'warn':
        return 'text-amber-600 dark:text-amber-400 font-medium';
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'fix':
        return 'text-indigo-600 dark:text-purple-300 font-semibold';
      default:
        return 'text-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-md flex flex-col h-[380px] sm:h-[460px]">
      
      {/* Console Top Toolbar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-800 mx-1" />
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              Build Console
            </span>
          </div>
          {isBuilding && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-blue-600 dark:text-blue-400 px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 font-semibold">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden xs:inline">Streaming</span>
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
              autoScroll 
                ? 'bg-blue-600/15 border-blue-500/30 text-blue-600 dark:text-blue-300 font-bold' 
                : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Toggle Auto-Scroll"
          >
            <ArrowDown className={`w-3.5 h-3.5 ${autoScroll ? 'animate-bounce' : ''}`} />
          </button>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-md text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Copy Filtered Console Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadLogs}
            className="p-1.5 rounded-md text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Download Raw .log Output"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-md text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Clear Console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Tab Strip */}
      <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Platform tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <button
            onClick={() => onPlatformFilterChange('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activePlatformFilter === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Stream ({logs.length})
          </button>

          {selectedPlatforms.map((p) => {
            const count = logs.filter(l => l.platform === p).length;
            const config = PLATFORM_CONFIGS[p];
            return (
              <button
                key={p}
                onClick={() => onPlatformFilterChange(p)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activePlatformFilter === p
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{config?.label || p}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 rounded-full ${
                    activePlatformFilter === p ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Level filter & Search input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Grep logs..."
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md pl-7 pr-3 py-1 text-[11px] font-mono text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 w-full sm:w-36"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md px-2 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Level: All</option>
            <option value="cmd">Commands Only</option>
            <option value="error">Errors Only</option>
            <option value="fix">Patches / Fixes</option>
          </select>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[11.5px] leading-relaxed space-y-1 select-text bg-white dark:bg-[#030712]"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-center p-8">
            <Terminal className="w-8 h-8 mb-2 opacity-50 text-blue-500" />
            <p className="text-xs font-semibold">No build output matching filter.</p>
            <p className="text-[11px] text-slate-400 mt-1">Start a build to stream compiler logs in real-time.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="group hover:bg-slate-100 dark:hover:bg-slate-900/60 px-1.5 py-0.5 rounded transition-colors flex items-start gap-2.5">
              <span className="text-slate-400 dark:text-slate-600 select-none text-[10px] pt-0.5 shrink-0 tabular-nums">
                {log.timestamp}
              </span>

              {log.platform && log.platform !== 'all' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-800 shrink-0 select-none font-semibold">
                  {PLATFORM_CONFIGS[log.platform as PlatformId]?.label || log.platform}
                </span>
              )}

              <div className="min-w-0 flex-1 break-words">
                {log.command && (
                  <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="text-slate-400 select-none">$</span>
                    <span>{log.command}</span>
                  </div>
                )}
                <span className={getLevelStyle(log.level)}>
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer Strip */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-500 font-mono">
        <div>
          <span>Lines: {filteredLogs.length} / {logs.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Cross-compilation avoided: routed to native CI runners</span>
        </div>
      </div>

    </div>
  );
};
