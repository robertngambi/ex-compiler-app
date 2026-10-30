import { Artifact, BuildProfile, PlatformId } from '../types';
import { createAllArtifactsZip, createDownloadableArtifactBlob } from './buildEngine';

export type SerializedArtifact = Omit<Artifact, 'blob' | 'downloadUrl'>;

export interface ActivityRecord {
  id: string;
  projectName: string;
  timestamp: string; // Human readable formatted time
  isoDate: string;
  category: 'mobile' | 'desktop';
  buildProfile: BuildProfile;
  status: 'success' | 'failed';
  platforms: PlatformId[];
  artifacts: SerializedArtifact[];
  customIconDataUrl?: string;
  sourceType: string;
}

const STORAGE_KEY = 'excompiler_activities_history';

// Helper to format friendly dates
export function formatFriendlyDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

// Get all activity records from storage
export function getSavedActivities(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialDemoActivities();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read activity history:', e);
    return [];
  }
}

// Save a completed build activity to storage
export function saveActivityRecord(
  projectName: string,
  category: 'mobile' | 'desktop',
  buildProfile: BuildProfile,
  artifacts: Artifact[],
  sourceType: string,
  customIconDataUrl?: string
): ActivityRecord {
  const serializedArtifacts: SerializedArtifact[] = artifacts.map(art => {
    const { blob, downloadUrl, ...rest } = art;
    return rest;
  });

  const newRecord: ActivityRecord = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectName,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    isoDate: new Date().toISOString(),
    category,
    buildProfile,
    status: 'success',
    platforms: artifacts.map(a => a.platform),
    artifacts: serializedArtifacts,
    customIconDataUrl,
    sourceType,
  };

  try {
    const existing = getSavedActivities();
    // Keep last 30 activities
    const updated = [newRecord, ...existing.filter(a => a.id !== newRecord.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save activity record:', e);
  }

  return newRecord;
}

// Delete an activity record
export function deleteActivityRecord(id: string): ActivityRecord[] {
  try {
    const existing = getSavedActivities();
    const updated = existing.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// Clear all activities
export function clearAllActivities(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Trigger browser download for a specific artifact in history
export async function redownloadArtifact(
  artifact: SerializedArtifact,
  projectName: string
): Promise<void> {
  const { blob } = await createDownloadableArtifactBlob(artifact, projectName);
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = artifact.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

// Trigger master ZIP download for an entire activity session
export async function redownloadActivityZip(activity: ActivityRecord): Promise<void> {
  // Generate blob for each artifact
  const preparedArtifacts: Artifact[] = [];
  for (const art of activity.artifacts) {
    const { blob, downloadUrl } = await createDownloadableArtifactBlob(art, activity.projectName);
    preparedArtifacts.push({
      ...art,
      blob,
      downloadUrl,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      buildLogUrl: `https://excompiler.cloud/logs/${activity.projectName}/${art.platform}.txt`,
    });
  }

  const masterBlob = await createAllArtifactsZip(preparedArtifacts, activity.projectName);
  const zipUrl = URL.createObjectURL(masterBlob);
  const a = document.createElement('a');
  a.href = zipUrl;
  a.download = `${activity.projectName.toLowerCase()}-${activity.buildProfile}-all-artifacts.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(zipUrl), 3000);
}

// Default initial demo activity for instant usability
function getInitialDemoActivities(): ActivityRecord[] {
  return [
    {
      id: 'act-sample-mobile-1',
      projectName: 'NovaPulse-App',
      timestamp: '10:45 AM',
      isoDate: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      category: 'mobile',
      buildProfile: 'release',
      status: 'success',
      platforms: ['android-apk', 'android-aab', 'ios-ipa'],
      sourceType: 'react-pwa',
      artifacts: [
        {
          id: 'art-demo-1',
          platform: 'android-apk',
          platformName: 'Android (APK)',
          type: 'apk',
          filename: 'novapulse-app-release.apk',
          sizeMb: 24.3,
          permalink: 'https://github.com/excompiler/releases/novapulse-app-release.apk',
          signed: true,
          buildProfile: 'release',
          checksum: 'sha256:d8a9e7f21b453e9a081c72bb',
          createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: 'https://excompiler.cloud/logs/novapulse/android-apk.txt',
          runner: 'android-docker-builder-01',
        },
        {
          id: 'art-demo-2',
          platform: 'android-aab',
          platformName: 'Android (AAB Bundle)',
          type: 'aab',
          filename: 'novapulse-app-release.aab',
          sizeMb: 18.2,
          permalink: 'https://github.com/excompiler/releases/novapulse-app-release.aab',
          signed: true,
          buildProfile: 'release',
          checksum: 'sha256:4f81c9a18032bb91f280a8de',
          createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: 'https://excompiler.cloud/logs/novapulse/android-aab.txt',
          runner: 'android-docker-builder-01',
        },
        {
          id: 'art-demo-3',
          platform: 'ios-ipa',
          platformName: 'iOS (IPA Archive)',
          type: 'ipa',
          filename: 'novapulse-app-release.ipa',
          sizeMb: 38.6,
          permalink: 'https://github.com/excompiler/releases/novapulse-app-release.ipa',
          signed: true,
          buildProfile: 'release',
          checksum: 'sha256:7bc330198aa73ef89028cb91',
          createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: 'https://excompiler.cloud/logs/novapulse/ios-ipa.txt',
          runner: 'macstadium-m2-node-04',
        },
      ],
    },
    {
      id: 'act-sample-desktop-2',
      projectName: 'PyDataStudio',
      timestamp: '08:15 AM',
      isoDate: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
      category: 'desktop',
      buildProfile: 'release',
      status: 'success',
      platforms: ['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage'],
      sourceType: 'python',
      artifacts: [
        {
          id: 'art-demo-4',
          platform: 'windows-exe',
          platformName: 'Windows (EXE)',
          type: 'exe',
          filename: 'pydatastudio-release.exe',
          sizeMb: 54.2,
          permalink: 'https://github.com/excompiler/releases/pydatastudio-release.exe',
          signed: true,
          buildProfile: 'release',
          checksum: 'sha256:ee9174fa19b98012cc45b0a1',
          createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: 'https://excompiler.cloud/logs/pydatastudio/windows-exe.txt',
          runner: 'windows-latest-runner',
        },
        {
          id: 'art-demo-5',
          platform: 'macos-dmg',
          platformName: 'macOS (DMG)',
          type: 'dmg',
          filename: 'pydatastudio-release.dmg',
          sizeMb: 68.4,
          permalink: 'https://github.com/excompiler/releases/pydatastudio-release.dmg',
          signed: true,
          buildProfile: 'release',
          checksum: 'sha256:1a87b03ef92bc71029da88a4',
          createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          buildLogUrl: 'https://excompiler.cloud/logs/pydatastudio/macos-dmg.txt',
          runner: 'macstadium-m2-node-04',
        },
      ],
    },
  ];
}
