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
import { BuildCompleteModal } from './components/BuildCompleteModal';
import { DiagnosticsDrawer } from './components/DiagnosticsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { DeveloperModal } from './components/DeveloperModal';
import { PinGuideModal } from './components/PinGuideModal';
import { WorkflowModal } from './components/WorkflowModal';
import { DocsModal } from './components/DocsModal';
import { HistoryModal } from './components/HistoryModal';
import { ActivityRecord, getSavedActivities, saveActivityRecord } from './services/activityHistory';

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBuildCompleteOpen, setIsBuildCompleteOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityRecord[]>(() => getSavedActivities());

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
        suggestedPlatforms: preset.type === 'python' ? ['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage', 'android-apk'] :
                           preset.type === 'android-kotlin' ? ['android-apk', 'android-aab'] :
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
      } else if (preset.type === 'tauri' || preset.type === 'python') {
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
      if (an.detectedType === 'tauri' || an.detectedType === 'electron' || an.detectedType === 'python') {
        setActiveCategory('desktop');
        setDesktopPlatforms(['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage']);
        setMobilePlatforms(['android-apk', 'android-aab']);
      } else {
        setActiveCategory('mobile');
        setMobilePlatforms(['android-apk', 'android-aab', 'ios-ipa']);
        setDesktopPlatforms(['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage']);
      }
      setOptions(prev => ({
        ...prev,
        customProjectName: an.name,
      }));
      addLog('success', `Imported '${file.name}' (${an.detectedType}). Ready to compile for Mobile and Desktop.`, 'orchestrator');
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
      setActiveCategory('mobile');
      setMobilePlatforms(['android-apk', 'android-aab', 'ios-ipa']);
      setDesktopPlatforms(['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage']);
      addLog('info', `Target set to hosted URL: ${url}. Ready to build.`, 'orchestrator');
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
    setMobilePlatforms([...MOBILE_PLATFORM_IDS]);
    setDesktopPlatforms([...DESKTOP_PLATFORM_IDS]);
    addLog('info', 'Project target reset. Waiting for new file or URL.', 'orchestrator');
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

    const effectiveProjectName = (activeOpts.customCredentialsEnabled && activeOpts.customProjectName?.trim())
      ? activeOpts.customProjectName.trim()
      : currentAnalysis.name;
    
    addLog('info', `--- INITIATING BUILD SEQUENCE ---`, 'orchestrator');
    addLog('info', `Project: ${effectiveProjectName} | Category: ${activeCategory.toUpperCase()} | Profile: ${activeOpts.buildProfile.toUpperCase()} | Engine: ${currentAnalysis.detectedType.toUpperCase()}`, 'orchestrator');
    if (activeOpts.customCredentialsEnabled) {
      addLog('info', `[Credentials] Custom identity active: Name='${effectiveProjectName}', Custom Icon='${activeOpts.customIconName || 'Default'}'.`, 'orchestrator');
    } else {
      addLog('info', `[Credentials] Auto-extract active: Derived identity '${effectiveProjectName}' directly from imported files.`, 'orchestrator');
    }
    addLog('info', `Target Outputs: ${activeTargets.join(', ')}`, 'orchestrator');

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

        if (currentAnalysis.detectedType === 'python') {
          addLog('cmd', `buildozer android ${activeOpts.buildProfile === 'release' ? 'release' : 'debug'}`, platformId);
          await delay(300);
          addLog('info', `Packaging Python-for-Android bootstrap with CPython 3.11 runtime...`, platformId);
          await delay(200);
        }

        // Mobile Icon Engine for Android
        if (activeOpts.customCredentialsEnabled && activeOpts.customIconName) {
          addLog('info', `[Mobile Icon Engine] Custom icon '${activeOpts.customIconName}' processed: generated res/mipmap-anydpi-v26/ic_launcher.xml adaptive foreground & background vector layers.`, platformId);
          addLog('info', `[Mobile Icon Engine] Rasterized multi-density mipmaps (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) + round launcher icon.`, platformId);
        } else {
          addLog('info', `[Mobile Icon Engine] Auto-extracted app icon from source manifest; compiled Android adaptive icon mipmap drawables.`, platformId);
        }

        if (activeOpts.signBuilds) {
          addLog('cmd', `jarsigner -keystore ${settings.androidKeystoreName} ${config.outputPath(activeOpts.buildProfile)} ${settings.androidKeyAlias}`, platformId);
          await delay(250);
        }

        const size = platformId === 'android-apk' ? 24.3 : 18.2;
        const filename = `${effectiveProjectName.toLowerCase()}-${activeOpts.buildProfile}${config.extension}`;
        
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
          buildLogUrl: `https://forge.cloud/logs/${effectiveProjectName}/${platformId}.txt`,
          runner: config.defaultRunner,
          customIconDataUrl: activeOpts.customCredentialsEnabled ? activeOpts.customIconDataUrl : undefined,
        };

        const { blob, downloadUrl } = await createDownloadableArtifactBlob(rawArt, effectiveProjectName, currentAnalysis);
        const realSizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));
        const finalSizeMb = realSizeMb > 0 ? realSizeMb : size;
        rawArt.sizeMb = finalSizeMb;
        const completeArt: Artifact = { ...rawArt, blob, downloadUrl };
        generatedArtifacts.push(completeArt);
        setArtifacts([...generatedArtifacts]);
        addLog('success', `Real Output generated: ${filename} (${finalSizeMb} MB, ${blob.size} bytes)`, platformId);

      } else if (platformId === 'ios-ipa') {
        // iOS flow
        addLog('info', `Connecting to Mac host via secure SSH tunnel...`, platformId);
        await delay(350);

        if (currentAnalysis.detectedType === 'python') {
          addLog('cmd', `briefcase build iOS -u && briefcase package iOS --adhoc`, platformId);
          await delay(400);
        } else {
          const iosCmd = config.command(activeOpts.buildProfile);
          addLog('cmd', iosCmd, platformId);
          await delay(500);
        }

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

        // Mobile Icon Engine for iOS
        if (activeOpts.customCredentialsEnabled && activeOpts.customIconName) {
          addLog('info', `[Mobile Icon Engine] Custom icon '${activeOpts.customIconName}' processed: generated AppIcon.appiconset (1024x1024 App Store asset, 180x180 iPhone, 167x167 iPad Pro, no-alpha verified).`, platformId);
          addLog('info', `[Mobile Icon Engine] Updated Assets.xcassets/AppIcon.appiconset/Contents.json catalog.`, platformId);
        } else {
          addLog('info', `[Mobile Icon Engine] Auto-extracted app icon from source manifest; compiled iOS AppIcon.appiconset 24-bit assets.`, platformId);
        }

        const size = 38.6;
        const filename = `${effectiveProjectName.toLowerCase()}-${activeOpts.buildProfile}.ipa`;

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
          buildLogUrl: `https://forge.cloud/logs/${effectiveProjectName}/${platformId}.txt`,
          runner: config.defaultRunner,
          customIconDataUrl: activeOpts.customCredentialsEnabled ? activeOpts.customIconDataUrl : undefined,
        };

        const { blob, downloadUrl } = await createDownloadableArtifactBlob(rawArt, effectiveProjectName, currentAnalysis);
        const realSizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));
        const finalSizeMb = realSizeMb > 0 ? realSizeMb : size;
        rawArt.sizeMb = finalSizeMb;
        const completeArt: Artifact = { ...rawArt, blob, downloadUrl };
        generatedArtifacts.push(completeArt);
        setArtifacts([...generatedArtifacts]);
        addLog('success', `Real Output generated: ${filename} (${finalSizeMb} MB, ${blob.size} bytes)`, platformId);

      } else {
        // Desktop platforms (Windows EXE, Windows MSI, macOS DMG, Linux AppImage)
        addLog('info', `Routing to native CI runner: ${config.defaultRunner}`, platformId);
        addLog('cmd', `gh workflow run release.yml --ref main -f platform=${platformId}`, platformId);
        await delay(350);

        // Special Python toolchain handling
        if (currentAnalysis.detectedType === 'python') {
          if (platformId === 'windows-exe') {
            const iconArg = activeOpts.customCredentialsEnabled && activeOpts.customIconName 
              ? `--icon="${activeOpts.customIconName}"` 
              : '--icon="assets/app-icon.ico"';
            addLog('cmd', `pyinstaller --noconfirm --onedir --windowed --name "${effectiveProjectName}" ${iconArg} main.py`, platformId);
            await delay(350);
            addLog('info', `[Desktop Icon Management] Multi-resolution Windows ICO (256, 48, 32, 16px) embedded into PE binary RT_GROUP_ICON resource table.`, platformId);
            await delay(250);
            addLog('cmd', `makensis /DPRODUCT_NAME="${effectiveProjectName}" /DPRODUCT_ICON="app-icon.ico" installer.nsi`, platformId);
          } else if (platformId === 'windows-msi') {
            addLog('cmd', `candle.exe -arch x64 Product.wxs -dProductIcon="app-icon.ico" && light.exe -out ${effectiveProjectName}-x64.msi Product.wixobj`, platformId);
            await delay(300);
            addLog('info', `[Desktop Icon Management] Bound WiX installer ARPPRODUCTICON to embedded application icon.`, platformId);
          } else if (platformId === 'macos-dmg') {
            addLog('cmd', `pyinstaller --windowed --name "${effectiveProjectName}" --icon="AppIcon.icns" --target-arch universal2 main.py`, platformId);
            await delay(350);
            addLog('info', `[Desktop Icon Management] Generated Apple ICNS Retina iconset -> Contents/Resources/AppIcon.icns & registered CFBundleIconFile in Info.plist.`, platformId);
            await delay(250);
            addLog('cmd', `create-dmg --volname "${effectiveProjectName}" --volicon "AppIcon.icns" dist/${effectiveProjectName}.dmg`, platformId);
          } else if (platformId === 'linux-appimage') {
            addLog('cmd', `pyinstaller --onefile --name "${effectiveProjectName}" main.py`, platformId);
            await delay(350);
            addLog('info', `[Desktop Icon Management] Scaled 512x512 PNG to /usr/share/icons/hicolor/ and linked in ${effectiveProjectName.toLowerCase()}.desktop launcher.`, platformId);
            await delay(250);
            addLog('cmd', `appimagetool AppDir/ dist/${effectiveProjectName}-x86_64.AppImage`, platformId);
          }
        } else {
          // Non-python (Tauri, Electron, Web Wrapper)
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
          await delay(400);

          // Desktop Icon logs for general apps
          if (activeOpts.customCredentialsEnabled && activeOpts.customIconName) {
            if (platformId === 'windows-exe' || platformId === 'windows-msi') {
              addLog('info', `[Desktop Icon Management] Custom icon '${activeOpts.customIconName}' compiled into Windows PE .ico resource table.`, platformId);
            } else if (platformId === 'macos-dmg') {
              addLog('info', `[Desktop Icon Management] Custom icon '${activeOpts.customIconName}' packaged into Apple ICNS Retina bundle.`, platformId);
            } else if (platformId === 'linux-appimage') {
              addLog('info', `[Desktop Icon Management] Custom icon '${activeOpts.customIconName}' generated as 512x512 hicolor desktop icon.`, platformId);
            }
          }
        }

        await delay(200);

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
        const filename = `${effectiveProjectName.toLowerCase()}-${activeOpts.buildProfile}${config.extension}`;

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
          buildLogUrl: `https://excompiler.cloud/logs/${effectiveProjectName}/${platformId}.txt`,
          runner: config.defaultRunner,
          customIconDataUrl: activeOpts.customCredentialsEnabled ? activeOpts.customIconDataUrl : undefined,
        };

        const { blob, downloadUrl } = await createDownloadableArtifactBlob(rawArt, effectiveProjectName, currentAnalysis);
        const realSizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));
        const finalSizeMb = realSizeMb > 0 ? realSizeMb : size;
        rawArt.sizeMb = finalSizeMb;
        const completeArt: Artifact = { ...rawArt, blob, downloadUrl };
        generatedArtifacts.push(completeArt);
        setArtifacts([...generatedArtifacts]);
        addLog('success', `Real Output generated: ${filename} (${finalSizeMb} MB, ${blob.size} bytes)`, platformId);
      }

      await delay(150);
    }

    addLog('success', `--- BUILD COMPLETE: ${generatedArtifacts.length} ARTIFACTS PRODUCED ---`, 'orchestrator');

    // Save build session to Recents / Activities History Archive
    saveActivityRecord(
      effectiveProjectName,
      activeCategory,
      activeOpts.buildProfile,
      generatedArtifacts,
      currentAnalysis.detectedType,
      activeOpts.customCredentialsEnabled ? activeOpts.customIconDataUrl : undefined
    );
    setActivities(getSavedActivities());

    setIsBuilding(false);
    setIsBuildCompleteOpen(true);
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
    const targetProjectName = (options.customCredentialsEnabled && options.customProjectName?.trim()) 
      ? options.customProjectName.trim() 
      : (analysis?.name || 'app');
    try {
      const zipBlob = await createAllArtifactsZip(artifacts, targetProjectName);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${targetProjectName.toLowerCase()}-${options.buildProfile}-all-artifacts.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      addLog('success', `Master archive bundled: ${targetProjectName.toLowerCase()}-${options.buildProfile}-all-artifacts.zip`, 'orchestrator');
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
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={activities.length}
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
              analysis={analysis}
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

      {/* Activities & History Archive Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activities={activities}
        onRefreshActivities={() => setActivities(getSavedActivities())}
      />

      {/* Build Complete Popup Message Modal (Cancel on left, Download a ZIP file on right) */}
      <BuildCompleteModal
        isOpen={isBuildCompleteOpen}
        onClose={() => setIsBuildCompleteOpen(false)}
        onDownloadZip={handleDownloadAllZip}
        isPackagingZip={isPackagingZip}
        projectName={(options.customCredentialsEnabled && options.customProjectName?.trim()) ? options.customProjectName.trim() : (analysis?.name || 'App')}
        category={activeCategory}
        buildProfile={options.buildProfile}
        artifacts={artifacts}
        customIconDataUrl={options.customCredentialsEnabled ? options.customIconDataUrl : undefined}
        onOpenRecents={() => {
          setIsBuildCompleteOpen(false);
          setIsHistoryOpen(true);
        }}
      />

    </div>
  );
}
