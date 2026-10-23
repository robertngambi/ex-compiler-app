import { PlatformConfig, PlatformId } from '../types';

export const PLATFORM_CONFIGS: Record<PlatformId, PlatformConfig> = {
  'android-apk': {
    id: 'android-apk',
    label: 'Android APK',
    category: 'mobile',
    platformName: 'Android (Sideload / Testing)',
    extension: '.apk',
    icon: 'Smartphone',
    defaultRunner: 'Local / Docker (JDK 17 + Android SDK 34)',
    command: (profile) => `./gradlew assemble${profile === 'release' ? 'Release' : 'Debug'} --stacktrace`,
    outputPath: (profile) => `app/build/outputs/apk/${profile}/app-${profile}.apk`,
  },
  'android-aab': {
    id: 'android-aab',
    label: 'Android AAB',
    category: 'mobile',
    platformName: 'Android (Google Play Store Bundle)',
    extension: '.aab',
    icon: 'Store',
    defaultRunner: 'Local / Docker (JDK 17 + Android SDK 34)',
    command: (profile) => `./gradlew bundle${profile === 'release' ? 'Release' : 'Debug'} --stacktrace`,
    outputPath: (profile) => `app/build/outputs/bundle/${profile}/app-${profile}.aab`,
  },
  'ios-ipa': {
    id: 'ios-ipa',
    label: 'iOS IPA',
    category: 'mobile',
    platformName: 'iOS (App Store & TestFlight)',
    extension: '.ipa',
    icon: 'Apple',
    defaultRunner: 'MacStadium Cloud Mac (Xcode 16 / macOS Sonoma) [Fallback: GitHub Actions macos-14]',
    command: (profile) => 
      `xcodebuild -scheme App -configuration ${profile === 'release' ? 'Release' : 'Debug'} -archivePath build/App.xcarchive archive && xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build/ -exportOptionsPlist ExportOptions.plist`,
    outputPath: () => `build/App.ipa`,
  },
  'windows-exe': {
    id: 'windows-exe',
    label: 'Windows EXE',
    category: 'desktop',
    platformName: 'Windows (NSIS Standalone Installer)',
    extension: '.exe',
    icon: 'Monitor',
    defaultRunner: 'GitHub Actions Matrix (windows-latest)',
    command: (profile) => 
      `cargo tauri build --target x86_64-pc-windows-msvc --config tauri.conf.json ${profile === 'release' ? '' : '--debug'}`,
    outputPath: (profile) => `src-tauri/target/x86_64-pc-windows-msvc/${profile}/bundle/nsis/App-Setup.exe`,
  },
  'windows-msi': {
    id: 'windows-msi',
    label: 'Windows MSI',
    category: 'desktop',
    platformName: 'Windows (WiX Enterprise Installer)',
    extension: '.msi',
    icon: 'PackageCheck',
    defaultRunner: 'GitHub Actions Matrix (windows-latest)',
    command: (profile) => 
      `cargo tauri build --target x86_64-pc-windows-msvc --bundles msi ${profile === 'release' ? '' : '--debug'}`,
    outputPath: (profile) => `src-tauri/target/x86_64-pc-windows-msvc/${profile}/bundle/msi/App.msi`,
  },
  'macos-dmg': {
    id: 'macos-dmg',
    label: 'macOS DMG',
    category: 'desktop',
    platformName: 'macOS (Universal / Apple Silicon & Intel)',
    extension: '.dmg',
    icon: 'Laptop',
    defaultRunner: 'GitHub Actions Matrix (macos-14)',
    command: (profile) => 
      `cargo tauri build --target universal-apple-darwin --bundles dmg ${profile === 'release' ? '' : '--debug'}`,
    outputPath: (profile) => `src-tauri/target/universal-apple-darwin/${profile}/bundle/dmg/App.dmg`,
  },
  'linux-appimage': {
    id: 'linux-appimage',
    label: 'Linux AppImage',
    category: 'desktop',
    platformName: 'Linux (Universal Self-Contained AppImage)',
    extension: '.AppImage',
    icon: 'Terminal',
    defaultRunner: 'GitHub Actions Matrix (ubuntu-22.04)',
    command: (profile) => 
      `cargo tauri build --target x86_64-unknown-linux-gnu --bundles appimage ${profile === 'release' ? '' : '--debug'}`,
    outputPath: (profile) => `src-tauri/target/x86_64-unknown-linux-gnu/${profile}/bundle/appimage/app_amd64.AppImage`,
  },
};

export const MOBILE_PLATFORM_IDS: PlatformId[] = [
  'android-apk',
  'android-aab',
  'ios-ipa',
];

export const DESKTOP_PLATFORM_IDS: PlatformId[] = [
  'windows-exe',
  'windows-msi',
  'macos-dmg',
  'linux-appimage',
];

export const ALL_PLATFORM_IDS: PlatformId[] = [
  ...MOBILE_PLATFORM_IDS,
  ...DESKTOP_PLATFORM_IDS,
];

