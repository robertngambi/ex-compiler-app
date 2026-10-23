import React, { useState, useEffect } from 'react';
import { X, Check, Smartphone, Monitor } from 'lucide-react';
import { PlatformConfig, PlatformId } from '../types';
import { PLATFORM_CONFIGS } from '../services/platformData';

interface OutputChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'mobile' | 'desktop';
  platformIds: PlatformId[];
  selectedIds: PlatformId[];
  onConfirm: (selected: PlatformId[]) => void;
}

export const OutputChecklistModal: React.FC<OutputChecklistModalProps> = ({
  isOpen,
  onClose,
  category,
  platformIds,
  selectedIds,
  onConfirm,
}) => {
  const [tempSelected, setTempSelected] = useState<PlatformId[]>(selectedIds);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedIds);
    }
  }, [isOpen, selectedIds]);

  if (!isOpen) return null;

  const toggleItem = (id: PlatformId) => {
    if (tempSelected.includes(id)) {
      setTempSelected(tempSelected.filter(p => p !== id));
    } else {
      setTempSelected([...tempSelected, id]);
    }
  };

  const handleSelectAll = () => {
    setTempSelected([...platformIds]);
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleOk = () => {
    onConfirm(tempSelected);
    onClose();
  };

  const title = category === 'mobile' ? 'Mobile Outputs' : 'Desktop Outputs';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
              {category === 'mobile' ? (
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-6 pt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">{tempSelected.length} of {platformIds.length} selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Checklist: 100% rounded buttons, NO outline borders, bold text when active, 100% rounded blue check badge */}
        <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
          {platformIds.map((id) => {
            const config = PLATFORM_CONFIGS[id];
            const isChecked = tempSelected.includes(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleItem(id)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-full border-0 transition-all cursor-pointer select-none text-left ${
                  isChecked
                    ? 'bg-blue-600/15 dark:bg-blue-600/20 text-slate-900 dark:text-white shadow-sm ring-0'
                    : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* 100% rounded Blue Checkbox Badge */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <span className={`text-xs block ${
                      isChecked 
                        ? 'font-bold text-slate-900 dark:text-white' 
                        : 'font-normal text-slate-700 dark:text-slate-300'
                    }`}>
                      {config?.label || id}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {config?.platformName}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                  {config?.extension}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Bottom: Cancel on left, Ok on right with 100% rounded buttons */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleOk}
            className="px-7 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Ok
          </button>
        </div>

      </div>
    </div>
  );
};
