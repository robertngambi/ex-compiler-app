import { PlatformId, PromptParseResult } from '../types';
import { ALL_PLATFORM_IDS } from './platformData';

export function parsePrompt(prompt: string): PromptParseResult {
  const lower = prompt.toLowerCase();
  const selectedPlatforms: Set<PlatformId> = new Set();

  const isAll = lower.includes('all platform') || lower.includes('every platform') || lower.includes('all target') || lower.includes('everything');

  if (isAll) {
    ALL_PLATFORM_IDS.forEach(p => selectedPlatforms.add(p));
  } else {
    // Android check
    if (lower.includes('apk') || lower.includes('android apk')) {
      selectedPlatforms.add('android-apk');
    }
    if (lower.includes('aab') || lower.includes('bundle') || lower.includes('android bundle') || lower.includes('play store')) {
      selectedPlatforms.add('android-aab');
    }
    if (lower.includes('android') && !lower.includes('apk') && !lower.includes('aab')) {
      selectedPlatforms.add('android-apk');
      selectedPlatforms.add('android-aab');
    }

    // iOS check
    if (lower.includes('ipa') || lower.includes('ios') || lower.includes('iphone') || lower.includes('apple') || lower.includes('testflight')) {
      selectedPlatforms.add('ios-ipa');
    }

    // Windows check
    if (lower.includes('exe') || lower.includes('windows exe')) {
      selectedPlatforms.add('windows-exe');
    }
    if (lower.includes('msi') || lower.includes('windows msi') || lower.includes('wix')) {
      selectedPlatforms.add('windows-msi');
    }
    if (lower.includes('windows') && !lower.includes('exe') && !lower.includes('msi')) {
      selectedPlatforms.add('windows-exe');
      selectedPlatforms.add('windows-msi');
    }

    // macOS check
    if (lower.includes('dmg') || lower.includes('macos') || lower.includes('mac') || lower.includes('osx')) {
      selectedPlatforms.add('macos-dmg');
    }

    // Linux check
    if (lower.includes('appimage') || lower.includes('linux') || lower.includes('ubuntu') || lower.includes('debian')) {
      selectedPlatforms.add('linux-appimage');
    }

    // Desktop check
    if (lower.includes('desktop')) {
      selectedPlatforms.add('windows-exe');
      selectedPlatforms.add('macos-dmg');
      selectedPlatforms.add('linux-appimage');
    }

    // Mobile check
    if (lower.includes('mobile')) {
      selectedPlatforms.add('android-apk');
      selectedPlatforms.add('ios-ipa');
    }
  }

  // Fallback if none parsed: select default APK + IPA
  if (selectedPlatforms.size === 0) {
    selectedPlatforms.add('android-apk');
    selectedPlatforms.add('ios-ipa');
  }

  // Profile
  const isDebug = lower.includes('debug');
  const profile = isDebug ? 'debug' : 'release';

  // Auto-fix
  const autoFix = !lower.includes('no auto-fix') && !lower.includes('disable auto-fix') && !lower.includes('dont fix') && !lower.includes("don't fix");

  // Dependencies
  const installDeps = !lower.includes('no dep') && !lower.includes('skip dep') && !lower.includes('offline');

  // Sign builds
  const sign = lower.includes('sign') || lower.includes('release') || lower.includes('keystore') || lower.includes('certificate');

  return {
    platforms: Array.from(selectedPlatforms),
    profile,
    autoFix,
    installDeps,
    sign,
    rawExplanation: `Parsed target: ${Array.from(selectedPlatforms).join(', ')} in ${profile} mode. Auto-fix is ${autoFix ? 'ON' : 'OFF'}. Missing dependency resolution is ${installDeps ? 'ON' : 'OFF'}. Signing is ${sign ? 'ON' : 'OFF'}.`,
  };
}
