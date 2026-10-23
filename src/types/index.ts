export type PlatformId = 
  | 'android-apk'
  | 'android-aab'
  | 'ios-ipa'
  | 'windows-exe'
  | 'windows-msi'
  | 'macos-dmg'
  | 'linux-appimage';

export type BuildProfile = 'debug' | 'release';

export type BuildStageStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'fixing' | 'skipped';

export interface PlatformConfig {
  id: PlatformId;
  label: string;
  category: 'mobile' | 'desktop';
  platformName: string;
  extension: string;
  icon: string;
  defaultRunner: string;
  command: (profile: BuildProfile) => string;
  outputPath: (profile: BuildProfile) => string;
}

export interface BuildLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'cmd' | 'success' | 'fix';
  message: string;
  platform?: PlatformId | 'all' | 'orchestrator';
  command?: string;
}

export interface DiagnosticError {
  id: string;
  platform: PlatformId;
  file: string;
  line?: number;
  errorCode?: string;
  category: 'syntax_error' | 'missing_dependency' | 'config_error' | 'signing_error' | 'platform_specific';
  message: string;
  rootCause: string;
  proposedDiff: string;
  status: 'detected' | 'auto_fixed' | 'pending_approval' | 'rejected' | 'manual_required';
  manualInstructions?: string;
  attempts: number;
  timestamp: string;
  fixedTimestamp?: string;
}

export interface Artifact {
  id: string;
  platform: PlatformId;
  platformName: string;
  type: string;
  filename: string;
  sizeMb: number;
  downloadUrl: string;
  permalink: string;
  signed: boolean;
  buildProfile: BuildProfile;
  checksum: string;
  createdAt: string;
  expiresAt: string;
  buildLogUrl: string;
  runner: string;
  blob?: Blob;
}

export interface ProjectAnalysis {
  name: string;
  detectedType: 'android-kotlin' | 'ios-swift' | 'tauri' | 'electron' | 'react-pwa' | 'web-url' | 'generic-web';
  summary: string;
  filesFound: string[];
  missingDepsDetected: string[];
  suggestedPlatforms: PlatformId[];
  isHostedUrl: boolean;
  sourceUrl?: string;
  packageId?: string;
  version?: string;
}

export interface ForgeSettings {
  androidKeystoreUploaded: boolean;
  androidKeyAlias: string;
  androidKeystoreName: string;
  appleTeamId: string;
  appleP8Configured: boolean;
  appleKeyId: string;
  appleIssuerId: string;
  githubPatConfigured: boolean;
  githubRepoTarget: string;
  customWebhookUrl: string;
}

export interface BuildOptions {
  selectedPlatforms: PlatformId[];
  autoFixErrors: boolean;
  installMissingDeps: boolean;
  signBuilds: boolean;
  buildProfile: BuildProfile;
}

export interface PromptParseResult {
  platforms: PlatformId[];
  profile: BuildProfile;
  autoFix: boolean;
  installDeps: boolean;
  sign: boolean;
  rawExplanation: string;
}
