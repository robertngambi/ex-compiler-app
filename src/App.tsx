import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Wrench, 
  AlertTriangle, 
  Terminal, 
  Play
} from 'lucide-react';
import { 
  Artifact, 
  BuildLog, 
  BuildOptions, 
  DiagnosticError, 
  ForgeSettings, 
  PlatformId, 
  ProjectAnalysis 
} from './types';
import { ALL_PLATFORM_IDS, DESKTOP_PLATFORM_IDS, MOBILE_PLATFORM_IDS, PLATFORM_CONFIGS } from './services/platformData';
import { 
  analyzeHostedUrl, 
  analyzeUploadedFile, 
  createAllArtifactsZip, 
  createDownloadableArtifactBlob 
} from './services/buildEngine';
import { SAMPLE_PRESETS, SamplePreset } from './services/samplePresets';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { ModeSwitcher } from './components/ModeSwitcher';
import { SimpleModeControls } from './components/SimpleModeControls';
import { PromptModeControls } from './components/PromptModeControls';
import { LiveConsole } from './components/LiveConsole';
import { ResultsPanel } from './components/ResultsPanel';
import { DiagnosticsDrawer } from './components/DiagnosticsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { DeveloperModal } from './components/DeveloperModal';
import { PinGuideModal } from './components/PinGuideModal';
import { WorkflowModal } from './components/WorkflowModal';
import { DocsModal } from './components/DocsModal';

const DEFAULT_SETTINGS: ForgeSettings = {
  androidKeystoreUploaded: true,
  androidKeyAlias: 'forge-release-key',
  androidKeystoreName: 'app-release.keystore',
  appleTeamId: 'A679Z84F3K',
  appleP8Configured: true,
  appleKeyId: 'AuthKey_9X28.p8',
  appleIssuerId: 'c84910ea-44a3-4b92-b892-0b89240f91a2',
  githubPatConfigured: true,
  githubRepoTarget: 'excompiler-builds/multi-platform-app',
  customWebhookUrl: '',
};

export default function App() {
  // Core state
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [activePreset, setActivePreset] = useState<SamplePreset | null>(null);
  const [mode, setMode] = useState<'simple' | 'prompt'>('simple');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPackagingZip, setIsPackagingZip] = useState(false);

  // Target Build Outputs state: Mobile outputs vs Desktop Outputs with mutual exclusivity
  const [activeCategory, setActiveCategory] = useState<'mobile' | 'desktop'>('mobile');
  const [mobilePlatforms, setMobilePlatforms] = useState<PlatformId[]>([...MOBILE_PLATFORM_IDS]);
  const [desktopPlatforms, setDesktopPlatforms] = useState<PlatformId[]>([...DESKTOP_PLATFORM_IDS]);

  // Modals & Drawers
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
  const [isPinGuideOpen, setIsPinGuideOpen] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Build configuration options
  const [options, setOptions] = useState<BuildOptions>({
    selectedPlatforms: [...MOBILE_PLATFORM_IDS],
    autoFixErrors: true,
    installMissingDeps: true,
    signBuilds: true,
    buildProfile: 'release',
  });

  // Theme / Background state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('excompiler_theme') || localStorage.getItem('forgeagent_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('excompiler_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Settings
  const [settings, setSettings] = useState<ForgeSettings>(() => {
    try {
      const saved = localStorage.getItem('excompiler_settings') || localStorage.getItem('forgeagent_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Logs & Diagnostics
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [activePlatformFilter, setActivePlatformFilter] = useState<PlatformId | 'all'>('all');
  const [errors, setErrors] = useState<DiagnosticError[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // Ref to cancel/pause build if needed
  const cancelBuildRef = useRef(false);

  // Load default sample preset on initial mount for instant zero-friction exploration
  useEffect(() => {
    if (!analysis) {
      handleSelectPreset(SAMPLE_PRESETS[0]);
    }
  }, []);

  const addLog = (
    level: BuildLog['level'], 
    message: string, 
    platform?: PlatformId | 'all' | 'orchestrator', 
    command?: string
  ) => {
    const newLog: BuildLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message,
      platform,
      command,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleSaveSettings = (newSettings: ForgeSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('excompiler_settings', JSON.stringify(newSettings));
    } catch {
      // storage quota or private browsing
    }
    addLog('info', 'Signing certificates and secrets updated.', 'orchestrator');
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setActivePreset(preset);
    setErrors([]);
    setArtifacts([]);

    if (preset.type === 'web-url' && preset.sampleUrl) {
      const an = analyzeHostedUrl(preset.sampleUrl);
      setAnalysis(an);
      setActiveCategory('mobile');
    } else {
      setAnalysis({
        name: preset.name,
        detectedType: preset.type,
        summary: preset.description,
        filesFound: Object.keys(preset.files),
        missingDepsDetected: preset.id === 'tauri-desktop-missing-webkit' ? ['libwebkit2gtk-4.0-dev', 'libayatana-appindicator3-dev'] : [],
        suggestedPlatforms: preset.type === 'android-kotlin' ? ['android-apk', 'android-aab'] :
                           preset.type === 'ios-swift' ? ['ios-ipa'] :
                           preset.type === 'tauri' ? ['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage'] :
                           [...MOBILE_PLATFORM_IDS],
        isHostedUrl: false,
        version: '1.0.0',
      });

      if (preset.type === 'android-kotlin' || preset.type === 'ios-swift') {
        setActiveCategory('mobile');
        if (preset.type === 'android-kotlin') {
          setMobilePlatforms(['android-apk', 'android-aab']);
        } else {
          setMobilePlatforms(['ios-ipa']);
        }
      } else if (preset.type === 'tauri') {
        setActiveCategory('desktop');
        setDesktopPlatforms(['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage']);
      }
    }

    addLog('info', `Loaded project preset: '${preset.name}'.`, 'orchestrator');
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setActivePreset(null);
    setArtifacts([]);
    setErrors([]);
    try {
      const an = await analyzeUploadedFile(file);
      setAnalysis(an);
      if (an.detectedType === 'tauri' || an.detectedType === 'electron') {
        setActiveCategory('desktop');
      } else {
        setActiveCategory('mobile');
      }
      addLog('success', `Analyzed archive '${file.name}' (${an.detectedType}).`, 'orchestrator');
    } catch (err: any) {
      addLog('error', err.message || 'Failed to inspect file', 'orchestrator');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlSubmit = (url: string) => {
    setIsAnalyzing(true);
    setActivePreset(null);
    setArtifacts([]);
    setErrors([]);
    try {
      const an = analyzeHostedUrl(url);
      setAnalysis(an);
      addLog('info', `Target set to hosted URL: ${url}.`, 'orchestrator');
    } catch (err: any) {
      addLog('error', err.message || 'Invalid URL supplied', 'orchestrator');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetTarget = () => {
    setAnalysis(null);
    setActivePreset(null);
    setArtifacts([]);
    setErrors([]);
    addLog('info', 'Project target reset.', 'orchestrator');
  };

  // The Autonomous Build Pipeline
  const runBuild = async (overrideOptions?: BuildOptions) => {
    // Determine the active platforms to build:
    // If overrideOptions (from Prompt Mode) is given, use its selectedPlatforms.
    // Otherwise, use ONLY the active category (mobile vs desktop), ensuring mutual exclusivity!
    const activeTargets = overrideOptions
      ? overrideOptions.selectedPlatforms
      : (activeCategory === 'mobile' ? mobilePlatforms : desktopPlatforms);

    const activeOpts: BuildOptions = {
      ...(overrideOptions || options),
      selectedPlatforms: activeTargets,
    };

    const currentAnalysis = analysis || analyzeHostedUrl('https://my-app.vercel.app');
    
    if (activeTargets.length === 0) {
      addLog('warn', `No outputs selected for ${activeCategory} category.`, 'orchestrator');
      return;
    }

    setIsBuilding(true);
    cancelBuildRef.current = false;
    setArtifacts([]);
    setErrors([]);
    
    addLog('info', `--- INITIATING BUILD SEQUENCE ---`, 'orchestrator');
    addLog('info', `Project: ${currentAnalysis.name} | Category: ${activeCategory.toUpperCase()} | Profile: ${activeOpts.buildProfile.toUpperCase()}`, 'orchestrator');
    addLog('info', `Outputs: ${activeTargets.join(', ')}`, 'orchestrator');

    // Collect new artifacts as they are generated
    const generatedArtifacts: Artifact[] = [];
    const collectedErrors: DiagnosticError[] = [];

    // Helper sleep
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (const platformId of activeTargets) {
      if (cancelBuildRef.current) break;

      const config = PLATFORM_CONFIGS[platformId];
      addLog('info', `>> Building output: ${config.label}`, platformId);

      // Simulation steps per platform
      if (platformId === 'android-apk' || platformId === 'android-aab') {
        // Android flow
        addLog('cmd', `docker run --rm -v $(pwd):/workspace android-sdk-34 ./gradlew --version`, platformId);
        await delay(350);
        
        // Execute build command
        const buildCmd = config.command(activeOpts.buildProfile);
        addLog('cmd', buildCmd, platformId);
        await delay(500);

        // Check if active preset has injected error for android
        if (activePreset && activePreset.injectedError && activePreset.injectedError.platform === platformId) {
          const inj = activePreset.injectedError;
          addLog('error', inj.errorCode || 'Compilation failure', platformId);

          const diagError: DiagnosticError = {
            id: `err-${Date.now()}-${platformId}`,
            ...inj,
            timestamp: new Date().toLocaleTimeString(),
            attempts: 1,
            status: activeOpts.autoFixErrors ? 'auto_fixed' : 'pending_approval',
          };
          collectedErrors.push(diagError);
          setErrors([...collectedErrors]);

          if (activeOpts.autoFixErrors) {
            addLog('fix', `[AUTO-FIX] Detected ${inj.category}. Root cause: ${inj.rootCause}`, platformId);
            await delay(400);
            addLog('cmd', `patch -p1 < ${inj.file.split('/').pop()}_fix.diff`, platformId);
            await delay(350);
            addLog('success', `Unified diff applied. Re-running compiler...`, platformId);
            addLog('cmd', buildCmd, platformId);
            await delay(600);
          } else {
            // Pause build and request user review
            addLog('warn', `Build paused. Review proposed patch in Diagnostics Drawer.`, platformId);
            setIsDiagnosticsOpen(true);
            setIsBuilding(false);
            return;
          }
        }

        if (activeOpts.signBuilds) {
          addLog('cmd', `jarsigner -keystore ${settings.androidKeystoreName} ${config.outputPath(activeOpts.buildProfile)} ${settings.androidKeyAlias}`, platformId);
          await delay(250);
        }

        const size = platformId === 'android-apk' ? 24.3 : 18.2;
        const filename = `${currentAnalysis.name.toLowerCase()}-${activeOpts.buildProfile}${config.extension}`;
        
        const rawArt: Omit<Artifact, 'blob' | 'downloadUrl'> = {
          id: `art-${platformId}-${Date.now()}`,
          platform: platformId,
          platformName: config.label,
          type: platformId === 'android-apk' ? 'apk' : 'aab',
          filename,
          sizeMb: size,
          permalink: `https://github.com/${settings.githubRepoTarget}/releases/download/v1.0.0/${filename}`,
          signed: activeOpts.signBuilds,
          buildProfile: activeOpts.buildProfile,
          checksum: `sha256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}b89`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: `https://forge.cloud/logs/${currentAnalysis.name}/${platformId}.txt`,
          runner: config.defaultRunner,
        };

        const { blob, downloadUrl } = await createDownloadableArtifactBlob(rawArt, currentAnalysis.name);
        const completeArt: Artifact = { ...rawArt, blob, downloadUrl };
        generatedArtifacts.push(completeArt);
        setArtifacts([...generatedArtifacts]);
        addLog('success', `Output generated: ${filename} (${size} MB)`, platformId);

      } else if (platformId === 'ios-ipa') {
        // iOS flow
        addLog('info', `Connecting to Mac host via secure SSH tunnel...`, platformId);
        await delay(350);

        const iosCmd = config.command(activeOpts.buildProfile);
        addLog('cmd', iosCmd, platformId);
        await delay(500);

        if (activePreset && activePreset.injectedError && activePreset.injectedError.platform === platformId) {
          const inj = activePreset.injectedError;
          addLog('error', inj.errorCode || 'Code signing failed', platformId);
          
          const diagError: DiagnosticError = {
            id: `err-${Date.now()}-${platformId}`,
            ...inj,
            timestamp: new Date().toLocaleTimeString(),
            attempts: 1,
            status: activeOpts.autoFixErrors ? 'auto_fixed' : 'pending_approval',
          };
          collectedErrors.push(diagError);
          setErrors([...collectedErrors]);

          if (activeOpts.autoFixErrors) {
            addLog('fix', `[AUTO-FIX] Regenerating ExportOptions.plist with Team ID ${settings.appleTeamId}...`, platformId);
            await delay(400);
            addLog('cmd', `sed -i '' 's/<string>development<\\/string>/<string>app-store<\\/string>/' ExportOptions.plist`, platformId);
            await delay(350);
            addLog('success', `ExportOptions repaired. Re-exporting IPA archive...`, platformId);
            await delay(450);
          } else {
            addLog('warn', `Build paused. Review signing patch in Diagnostics Drawer.`, platformId);
            setIsDiagnosticsOpen(true);
            setIsBuilding(false);
            return;
          }
        }

        const size = 38.6;
        const filename = `${currentAnalysis.name.toLowerCase()}-${activeOpts.buildProfile}.ipa`;

        const rawArt: Omit<Artifact, 'blob' | 'downloadUrl'> = {
          id: `art-${platformId}-${Date.now()}`,
          platform: platformId,
          platformName: config.label,
          type: 'ipa',
          filename,
          sizeMb: size,
          permalink: `https://github.com/${settings.githubRepoTarget}/releases/download/v1.0.0/${filename}`,
          signed: activeOpts.signBuilds,
          buildProfile: activeOpts.buildProfile,
          checksum: `sha256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}7f1`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: `https://forge.cloud/logs/${currentAnalysis.name}/${platformId}.txt`,
          runner: config.defaultRunner,
        };

        const { blob, downloadUrl } = await createDownloadableArtifactBlob(rawArt, currentAnalysis.name);
        const completeArt: Artifact = { ...rawArt, blob, downloadUrl };
        generatedArtifacts.push(completeArt);
        setArtifacts([...generatedArtifacts]);
        addLog('success', `Output generated: ${filename} (${size} MB)`, platformId);

      } else {
        // Desktop platforms (Windows EXE, Windows MSI, macOS DMG, Linux AppImage)
        addLog('info', `Routing to native CI runner: ${config.defaultRunner}`, platformId);
        addLog('cmd', `gh workflow run release.yml --ref main -f platform=${platformId}`, platformId);
        await delay(400);

        if (activePreset && activePreset.injectedError && activePreset.injectedError.platform === platformId) {
          const inj = activePreset.injectedError;
          addLog('error', inj.errorCode || 'Dependency missing', platformId);
          
          const diagError: DiagnosticError = {
            id: `err-${Date.now()}-${platformId}`,
            ...inj,
            timestamp: new Date().toLocaleTimeString(),
            attempts: 1,
            status: activeOpts.autoFixErrors ? 'auto_fixed' : 'pending_approval',
          };
          collectedErrors.push(diagError);
          setErrors([...collectedErrors]);

          if (activeOpts.autoFixErrors || activeOpts.installMissingDeps) {
            addLog('fix', `[AUTO-FIX] Injected 'sudo apt-get install -y libwebkit2gtk-4.0-dev' into CI matrix workflow...`, platformId);
            await delay(400);
            addLog('success', `CI dependency step updated. Restarting job...`, platformId);
            await delay(400);
          } else {
            addLog('warn', `Build paused. Review missing dependency diff in Diagnostics Drawer.`, platformId);
            setIsDiagnosticsOpen(true);
            setIsBuilding(false);
            return;
          }
        }

        addLog('cmd', config.command(activeOpts.buildProfile), platformId);
        await delay(450);

        const sizeMap: Record<PlatformId, number> = {
          'android-apk': 24.3,
          'android-aab': 18.2,
          'ios-ipa': 38.6,
          'windows-exe': 54.2,
          'windows-msi': 52.8,
          'macos-dmg': 68.4,
          'linux-appimage': 74.1,
        };

        const size = sizeMap[platformId] || 45.0;
        const filename = `${currentAnalysis.name.toLowerCase()}-${activeOpts.buildProfile}${config.extension}`;

        const rawArt: Omit<Artifact, 'blob' | 'downloadUrl'> = {
          id: `art-${platformId}-${Date.now()}`,
          platform: platformId,
          platformName: config.label,
          type: config.extension.replace('.', ''),
          filename,
          sizeMb: size,
          permalink: `https://github.com/${settings.githubRepoTarget}/releases/download/v1.0.0/${filename}`,
          signed: activeOpts.signBuilds,
          buildProfile: activeOpts.buildProfile,
          checksum: `sha256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}a92`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: `https://excompiler.cloud/logs/${currentAnalysis.name}/${platformId}.txt`,
          runner: config.defaultRunner,
        };

        const { blob, downloadUrl } = await createDownloadableArtifactBlob(rawArt, currentAnalysis.name);
        const completeArt: Artifact = { ...rawArt, blob, downloadUrl };
        generatedArtifacts.push(completeArt);
        setArtifacts([...generatedArtifacts]);
        addLog('success', `Output generated: ${filename} (${size} MB)`, platformId);
      }

      await delay(150);
    }

    addLog('success', `--- BUILD COMPLETE: ${generatedArtifacts.length} ARTIFACTS PRODUCED ---`, 'orchestrator');
    setIsBuilding(false);
  };

  const handleApplyPatch = async (errorId: string) => {
    const err = errors.find(e => e.id === errorId);
    if (!err) return;

    addLog('fix', `User approved patch for ${err.file}. Applying diff...`, err.platform);
    addLog('cmd', `patch -p1 < ${err.file.split('/').pop()}_fix.diff`, err.platform);

    setErrors(prev => prev.map(e => e.id === errorId ? { ...e, status: 'auto_fixed', attempts: e.attempts + 1 } : e));
    setIsDiagnosticsOpen(false);

    // Resume build
    addLog('info', `Resuming build...`, err.platform);
    await runBuild();
  };

  const handleRejectPatch = (errorId: string) => {
    const err = errors.find(e => e.id === errorId);
    if (err) {
      addLog('error', `Patch rejected by user. Build aborted.`, err.platform);
    }
    setErrors(prev => prev.map(e => e.id === errorId ? { ...e, status: 'rejected' } : e));
    setIsDiagnosticsOpen(false);
  };

  const handleDownloadAllZip = async () => {
    if (artifacts.length === 0) return;
    setIsPackagingZip(true);
    try {
      const zipBlob = await createAllArtifactsZip(artifacts, analysis?.name || 'forge-app');
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(analysis?.name || 'app').toLowerCase()}-release.zip`;
      a.click();
      URL.revokeObjectURL(url);
      addLog('success', `Master archive bundled.`, 'orchestrator');
    } catch (err: any) {
      addLog('error', `Failed to bundle master ZIP: ${err.message}`, 'orchestrator');
    } finally {
      setIsPackagingZip(false);
    }
  };

  const currentActiveOutputs = activeCategory === 'mobile' ? mobilePlatforms : desktopPlatforms;

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans selection:bg-blue-500/30 selection:text-blue-200 flex flex-col ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Bar Contract */}
      <Navbar
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Top Introductory Contexts: Centered */}
        <div className="space-y-1.5 text-center max-w-2xl mx-auto py-1 sm:py-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight ex-compiler-title">
            Ex-Compiler
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto px-2">
            Multi-platform compiler. Ingest hosted URLs or project archives to build signed, native outputs for Mobile and Desktop.
          </p>
        </div>

        {/* Input Zone: File Drag-and-drop or Hosted URL */}
        <HeroInput
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          onUrlSubmit={handleUrlSubmit}
          onFileUpload={handleFileUpload}
          onSelectPreset={handleSelectPreset}
          onReset={handleResetTarget}
        />

        {/* Diagnostics banner button if errors detected */}
        {errors.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Diagnostics Engine Detected {errors.length} Issue{errors.length === 1 ? '' : 's'}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {errors.some(e => e.status === 'auto_fixed') 
                    ? 'Patches automatically generated and applied.' 
                    : 'Action required: Review proposed unified diff patch.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Inspect Diagnostics</span>
            </button>
          </div>
        )}

        {/* Mode Switcher: Simple Mode vs Prompt Mode */}
        <div className="space-y-4 sm:space-y-5 pt-1">
          <ModeSwitcher mode={mode} onChange={setMode} />

          {/* Mode Controls */}
          {mode === 'simple' ? (
            <SimpleModeControls
              options={options}
              onOptionsChange={setOptions}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              mobilePlatforms={mobilePlatforms}
              onMobilePlatformsChange={setMobilePlatforms}
              desktopPlatforms={desktopPlatforms}
              onDesktopPlatformsChange={setDesktopPlatforms}
              onStartBuild={() => runBuild()}
              isBuilding={isBuilding}
              disabled={isAnalyzing}
            />
          ) : (
            <PromptModeControls
              onStartBuildWithParsedOptions={(parsedOpts) => {
                setOptions(parsedOpts);
                runBuild(parsedOpts);
              }}
              isBuilding={isBuilding}
              disabled={isAnalyzing}
            />
          )}
        </div>

        {/* Live Build Console */}
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Live Build Console</span>
            </h3>
          </div>

          <LiveConsole
            logs={logs}
            selectedPlatforms={currentActiveOutputs}
            isBuilding={isBuilding}
            onClearLogs={() => setLogs([])}
            activePlatformFilter={activePlatformFilter}
            onPlatformFilterChange={setActivePlatformFilter}
          />
        </div>

        {/* Results Panel: Downloadable Artifacts */}
        {artifacts.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <ResultsPanel
              artifacts={artifacts}
              projectName={analysis?.name || 'App'}
              onDownloadAll={handleDownloadAllZip}
              isPackagingZip={isPackagingZip}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold ex-compiler-title">Ex-Compiler</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Platform App Compiler</span>
          </div>
          <div>
            <span>Native Matrix Runners · Android · iOS · Windows · macOS · Linux</span>
          </div>
        </div>
      </footer>

      {/* Diagnostics Drawer */}
      <DiagnosticsDrawer
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        errors={errors}
        onApplyPatch={handleApplyPatch}
        onRejectPatch={handleRejectPatch}
        isApplyingPatch={isBuilding}
      />

      {/* Settings Modal (Theme, Build Options & 'Continue as developer' button) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        buildOptions={options}
        onOptionsChange={setOptions}
        theme={theme}
        onThemeChange={setTheme}
        onOpenDeveloperModal={() => setIsDeveloperOpen(true)}
        onOpenWorkflow={() => setIsWorkflowOpen(true)}
      />

      {/* Developer Configuration Modal (API Keys, Keystores, Apple credentials & PIN Guide) */}
      <DeveloperModal
        isOpen={isDeveloperOpen}
        onClose={() => setIsDeveloperOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenPinGuide={() => setIsPinGuideOpen(true)}
        theme={theme}
      />

      {/* PIN & Keys Configuration Guide Modal */}
      <PinGuideModal
        isOpen={isPinGuideOpen}
        onClose={() => setIsPinGuideOpen(false)}
      />

      {/* CI Workflow Modal */}
      <WorkflowModal
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        projectName={analysis?.name || 'MyApplication'}
        options={options}
      />

      {/* Output Files Format & Generation Guide Modal (Triggered by Header ?) */}
      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

    </div>
  );
}
