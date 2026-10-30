import React, { useState, useRef } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Play, 
  Check,
  SlidersHorizontal,
  FolderOpen,
  X as XIcon,
  CheckCircle2,
  Laptop,
  Terminal,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { BuildOptions, PlatformId, ProjectAnalysis } from '../types';
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
  analysis?: ProjectAnalysis | null;
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
  analysis,
}) => {
  const [modalCategory, setModalCategory] = useState<'mobile' | 'desktop' | null>(null);
  const [showIconManagement, setShowIconManagement] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const isCredentialsActive = !!options.customCredentialsEnabled;

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

  const handleToggleCredentials = () => {
    const nextState = !isCredentialsActive;
    onOptionsChange({
      ...options,
      customCredentialsEnabled: nextState,
      customProjectName: options.customProjectName !== undefined ? options.customProjectName : (analysis?.name || ''),
    });
  };

  const handleIconFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onOptionsChange({
        ...options,
        customIconName: file.name,
        customIconDataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearIcon = () => {
    if (iconInputRef.current) iconInputRef.current.value = '';
    onOptionsChange({
      ...options,
      customIconName: undefined,
      customIconDataUrl: undefined,
    });
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

      {/* Important Credentials Container */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3.5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Project Identity & Credentials
              </h4>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isCredentialsActive
                  ? 'bg-blue-600/15 dark:bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
              }`}>
                {isCredentialsActive ? 'Custom Active' : 'Auto-Extracting'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {isCredentialsActive 
                ? 'Specify custom project name and application icon file.' 
                : 'Auto-extracts name and icon from imported project files and manifests.'}
            </p>
          </div>

          {/* The "Important credentials" Button */}
          <button
            type="button"
            onClick={handleToggleCredentials}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-0 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 select-none ${
              isCredentialsActive
                ? 'bg-blue-600 text-white shadow-blue-500/20 ring-2 ring-blue-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Important credentials</span>
            <div className={`w-2 h-2 rounded-full ${isCredentialsActive ? 'bg-white' : 'bg-slate-400 dark:bg-slate-500'}`} />
          </button>
        </div>

        {/* Inactive Mode Notice: Extracts name directly from imported files */}
        {!isCredentialsActive ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Auto-extracting identity from source: <strong className="text-slate-900 dark:text-white font-mono">{analysis?.name || 'Auto-detected'}</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Click &quot;Important credentials&quot; to customize name &amp; icon
            </span>
          </div>
        ) : (
          /* Active Mode Fields in the same container */
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Field 1: Input box for typing the project name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Project Name</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono">Custom package ID</span>
                </label>
                <div>
                  <input
                    type="text"
                    value={options.customProjectName ?? (analysis?.name || '')}
                    onChange={(e) => onOptionsChange({ ...options, customProjectName: e.target.value })}
                    placeholder={analysis?.name || 'Enter custom project name'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-inner transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Import Icon file with Open files button */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Import Icon file</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono">.ico, .icns, .png, .svg</span>
                </label>

                <input
                  ref={iconInputRef}
                  type="file"
                  accept=".ico,.icns,.png,.svg,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleIconFileSelect}
                />

                {!options.customIconDataUrl ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Open files</span>
                    </button>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Search for an icon image (.ico, .icns, .png, .svg)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        <img 
                          src={options.customIconDataUrl} 
                          alt="Custom app icon preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                          {options.customIconName || 'custom-icon.png'}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Icon loaded & verified
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleClearIcon}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
                        title="Remove custom icon"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 'More on file icon management' Button directly below import/open files */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowIconManagement(!showIconManagement)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 transition-all cursor-pointer shadow-xs select-none"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>More on file icon management</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showIconManagement ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Detailed File Icon Management Section (Mobile + Desktop) */}
            {showIconManagement && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Cross-Platform Icon Transformation &amp; Embedding Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 w-fit">
                    Mobile &amp; Desktop Specifications
                  </span>
                </div>

                {/* 1. Mobile Apps Icon Management */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Mobile Apps Icon Management</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                    {/* Android */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Android (.apk / .aab)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        Generates <strong className="text-slate-800 dark:text-slate-200">Adaptive Icon XML</strong> (<code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">mipmap-anydpi-v26/ic_launcher.xml</code>) separating foreground vector &amp; background color. Auto-rasterizes multi-density buckets (<strong className="text-slate-800 dark:text-slate-200">mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi</strong> 48px–192px), rounded launcher icons, and monochrome themed icons for Android 13+.
                      </p>
                    </div>

                    {/* iOS */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                        <span>iOS (.ipa)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        Bundles official <strong className="text-slate-800 dark:text-slate-200">AppIcon.appiconset</strong> with validated 24-bit RGB without alpha channel (strict Apple App Store compliance). Formats 1024x1024 App Store master, 180x180 iPhone Retina (60pt@3x), 120x120 (60pt@2x), and 167x167 iPad Pro with updated <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">Contents.json</code>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Desktop Apps Icon Management */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Monitor className="w-3.5 h-3.5 text-blue-500" />
                    <span>Desktop Outputs Icon Management</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                    {/* Windows */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Monitor className="w-3.5 h-3.5 text-blue-500" />
                        <span>Windows (.exe / .msi)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        Auto-compiled into multi-resolution <strong className="text-slate-800 dark:text-slate-200">.ico</strong> (256, 48, 32, 16px). Embedded into PE binary resource table <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">RT_GROUP_ICON</code> and NSIS installer shortcuts.
                      </p>
                    </div>

                    {/* macOS */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                        <span>macOS (.dmg / .app)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        Bundled into Apple <strong className="text-slate-800 dark:text-slate-200">AppIcon.icns</strong> up to 1024x1024 Retina. Placed in <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">Contents/Resources/</code>, linked via <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">CFBundleIconFile</code>, and applied to DMG volume.
                      </p>
                    </div>

                    {/* Linux */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Linux (.AppImage)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        Scaled to 512x512 PNG, deployed to <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">/usr/share/icons/hicolor/</code> and linked via <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">Icon=</code> entry in the FreeDesktop launcher.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* Start Build CTA Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-300 capitalize">{activeCategory} Outputs: </span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{activeCount} selected</span>
          <span className="text-slate-400 dark:text-slate-600 mx-1.5">·</span>
          <span className="text-slate-600 dark:text-slate-400 uppercase font-mono font-semibold">{options.buildProfile} mode</span>
        </div>

        {/* START BUILD BUTTON: Always ready to build */}
        <button
          type="button"
          onClick={() => {
            if (activeCount === 0) {
              if (activeCategory === 'mobile') {
                onMobilePlatformsChange([...MOBILE_PLATFORM_IDS]);
              } else {
                onDesktopPlatformsChange([...DESKTOP_PLATFORM_IDS]);
              }
            }
            onStartBuild();
          }}
          disabled={disabled || isBuilding}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold ml-1">
                READY
              </span>
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
