import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Play, 
  Check 
} from 'lucide-react';
import { BuildOptions, PlatformId } from '../types';
import { MOBILE_PLATFORM_IDS, DESKTOP_PLATFORM_IDS } from '../services/platformData';
import { OutputChecklistModal } from './OutputChecklistModal';

interface SimpleModeControlsProps {
  options: BuildOptions;
  onOptionsChange: (newOptions: BuildOptions) => void;
  activeCategory: 'mobile' | 'desktop';
  onCategoryChange: (category: 'mobile' | 'desktop') => void;
  mobilePlatforms: PlatformId[];
  onMobilePlatformsChange: (platforms: PlatformId[]) => void;
  desktopPlatforms: PlatformId[];
  onDesktopPlatformsChange: (platforms: PlatformId[]) => void;
  onStartBuild: () => void;
  isBuilding: boolean;
  disabled?: boolean;
}

export const SimpleModeControls: React.FC<SimpleModeControlsProps> = ({
  options,
  onOptionsChange,
  activeCategory,
  onCategoryChange,
  mobilePlatforms,
  onMobilePlatformsChange,
  desktopPlatforms,
  onDesktopPlatformsChange,
  onStartBuild,
  isBuilding,
  disabled,
}) => {
  const [modalCategory, setModalCategory] = useState<'mobile' | 'desktop' | null>(null);

  const handleOpenMobileModal = () => {
    setModalCategory('mobile');
  };

  const handleOpenDesktopModal = () => {
    setModalCategory('desktop');
  };

  const handleConfirmMobile = (selected: PlatformId[]) => {
    onMobilePlatformsChange(selected);
    onCategoryChange('mobile');
  };

  const handleConfirmDesktop = (selected: PlatformId[]) => {
    onDesktopPlatformsChange(selected);
    onCategoryChange('desktop');
  };

  const activeCount = activeCategory === 'mobile' ? mobilePlatforms.length : desktopPlatforms.length;
  const isMobileActive = activeCategory === 'mobile';
  const isDesktopActive = activeCategory === 'desktop';

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Target Build Outputs */}
      <div className="space-y-2.5">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Target Build Outputs
        </h4>

        {/* Exactly 2 buttons: Mobile outputs & Desktop Outputs with mutual exclusivity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
          
          {/* Mobile outputs button: 100% rounded, NO outline borders, bold text when active, 100% rounded blue check mark */}
          <button
            type="button"
            onClick={handleOpenMobileModal}
            className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 rounded-full border-0 text-left transition-all cursor-pointer select-none shadow-xs ${
              isMobileActive
                ? 'bg-blue-600/15 dark:bg-blue-600/20 text-slate-900 dark:text-white ring-0'
                : 'bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isMobileActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs sm:text-sm block truncate ${
                  isMobileActive 
                    ? 'font-bold text-slate-900 dark:text-white' 
                    : 'font-normal text-slate-600 dark:text-slate-400'
                }`}>
                  Mobile Outputs
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                  {mobilePlatforms.length} output{mobilePlatforms.length === 1 ? '' : 's'} configured
                </span>
              </div>
            </div>

            {/* Right side: 100% rounded check mark in blue */}
            <div className="flex items-center shrink-0 ml-2">
              {isMobileActive ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/30">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40" />
              )}
            </div>
          </button>

          {/* Desktop Outputs button: 100% rounded, NO outline borders, bold text when active, 100% rounded blue check mark */}
          <button
            type="button"
            onClick={handleOpenDesktopModal}
            className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 rounded-full border-0 text-left transition-all cursor-pointer select-none shadow-xs ${
              isDesktopActive
                ? 'bg-blue-600/15 dark:bg-blue-600/20 text-slate-900 dark:text-white ring-0'
                : 'bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isDesktopActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs sm:text-sm block truncate ${
                  isDesktopActive 
                    ? 'font-bold text-slate-900 dark:text-white' 
                    : 'font-normal text-slate-600 dark:text-slate-400'
                }`}>
                  Desktop Outputs
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                  {desktopPlatforms.length} output{desktopPlatforms.length === 1 ? '' : 's'} configured
                </span>
              </div>
            </div>

            {/* Right side: 100% rounded check mark in blue */}
            <div className="flex items-center shrink-0 ml-2">
              {isDesktopActive ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/30">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40" />
              )}
            </div>
          </button>

        </div>
      </div>

      {/* Start Build CTA Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-300 capitalize">{activeCategory} Outputs: </span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{activeCount} selected</span>
          <span className="text-slate-400 dark:text-slate-600 mx-1.5">·</span>
          <span className="text-slate-600 dark:text-slate-400 uppercase font-mono font-semibold">{options.buildProfile} mode</span>
        </div>

        {/* START BUILD BUTTON */}
        <button
          type="button"
          onClick={onStartBuild}
          disabled={disabled || activeCount === 0 || isBuilding}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isBuilding ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>BUILDING...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START BUILD</span>
            </>
          )}
        </button>
      </div>

      {/* Checklist Modals */}
      <OutputChecklistModal
        isOpen={modalCategory === 'mobile'}
        onClose={() => setModalCategory(null)}
        category="mobile"
        platformIds={MOBILE_PLATFORM_IDS}
        selectedIds={mobilePlatforms}
        onConfirm={handleConfirmMobile}
      />

      <OutputChecklistModal
        isOpen={modalCategory === 'desktop'}
        onClose={() => setModalCategory(null)}
        category="desktop"
        platformIds={DESKTOP_PLATFORM_IDS}
        selectedIds={desktopPlatforms}
        onConfirm={handleConfirmDesktop}
      />

    </div>
  );
};
