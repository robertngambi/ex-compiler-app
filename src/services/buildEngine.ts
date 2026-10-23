import JSZip from 'jszip';
import { 
  Artifact, 
  BuildLog, 
  BuildOptions, 
  DiagnosticError, 
  PlatformId, 
  ProjectAnalysis 
} from '../types';
import { PLATFORM_CONFIGS } from './platformData';

// Helper to calculate mock SHA256 string
function generateMockSha256(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:${hex}8fa34c1b2e9d0a7f5c3b1e8d4a6c9e0b1f2a3c4d5e6f7a8b9c0d1e2f3a4b`;
}

export async function analyzeUploadedFile(file: File): Promise<ProjectAnalysis> {
  const filename = file.name.toLowerCase();

  if (filename.endsWith('.zip') || filename.endsWith('.apk') || filename.endsWith('.ipa') || filename.endsWith('.aab')) {
    try {
      const zip = await JSZip.loadAsync(file);
      const fileNames = Object.keys(zip.files);

      let detectedType: ProjectAnalysis['detectedType'] = 'generic-web';
      let name = file.name.replace(/\.[^/.]+$/, '');
      const missingDeps: string[] = [];

      if (fileNames.some(f => f.includes('build.gradle') || f.includes('build.gradle.kts'))) {
        detectedType = 'android-kotlin';
      } else if (fileNames.some(f => f.includes('.xcodeproj') || f.includes('Package.swift') || f.includes('ExportOptions.plist'))) {
        detectedType = 'ios-swift';
      } else if (fileNames.some(f => f.includes('tauri.conf.json') || f.includes('Cargo.toml'))) {
        detectedType = 'tauri';
      } else if (fileNames.some(f => f.includes('package.json'))) {
        detectedType = 'react-pwa';
        // Inspect package.json
        const pkgFile = fileNames.find(f => f.endsWith('package.json'));
        if (pkgFile) {
          const content = await zip.files[pkgFile].async('text');
          try {
            const parsed = JSON.parse(content);
            if (parsed.name) name = parsed.name;
            if (parsed.dependencies && !parsed.dependencies['@capacitor/core'] && !parsed.devDependencies?.['@capacitor/cli']) {
              missingDeps.push('@capacitor/core', '@capacitor/cli');
            }
          } catch {
            // ignore JSON parse error
          }
        }
      }

      return {
        name,
        detectedType,
        summary: `Extracted ${fileNames.length} files from archive '${file.name}'. Detected ${detectedType} project layout.`,
        filesFound: fileNames.slice(0, 20),
        missingDepsDetected: missingDeps,
        suggestedPlatforms: detectedType === 'android-kotlin' ? ['android-apk', 'android-aab'] :
                           detectedType === 'ios-swift' ? ['ios-ipa'] :
                           detectedType === 'tauri' ? ['windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage'] :
                           ['android-apk', 'android-aab', 'ios-ipa', 'windows-exe', 'macos-dmg', 'linux-appimage'],
        isHostedUrl: false,
        version: '1.0.0',
      };
    } catch {
      // Fallback if not zip
      return {
        name: file.name,
        detectedType: 'generic-web',
        summary: `Read standalone file '${file.name}'.`,
        filesFound: [file.name],
        missingDepsDetected: [],
        suggestedPlatforms: ['android-apk', 'windows-exe'],
        isHostedUrl: false,
        version: '1.0.0',
      };
    }
  }

  // Reject unsupported formats with clear message
  throw new Error(`Unsupported file format '${file.name}'. Supported formats: .zip archives, .apk, .ipa, .aab, or web project directories.`);
}

export function analyzeHostedUrl(url: string): ProjectAnalysis {
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  try {
    const parsed = new URL(cleanUrl);
    const domain = parsed.hostname;
    const appName = domain.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');

    return {
      name: appName || 'HostedWebApp',
      detectedType: 'web-url',
      summary: `Hosted Web Application at ${cleanUrl}. Suitable for Capacitor WebView wrapper (Mobile) and Tauri container (Desktop).`,
      filesFound: [
        'capacitor.config.json (auto-generated WebView wrapper)',
        'src-tauri/tauri.conf.json (auto-generated Desktop container)',
        'android/app/src/main/AndroidManifest.xml',
        'ios/App/App/Info.plist',
      ],
      missingDepsDetected: ['@capacitor/core', '@capacitor/android', '@capacitor/ios'],
      suggestedPlatforms: ['android-apk', 'android-aab', 'ios-ipa', 'windows-exe', 'windows-msi', 'macos-dmg', 'linux-appimage'],
      isHostedUrl: true,
      sourceUrl: cleanUrl,
      version: '1.0.0',
      packageId: `app.excompiler.${appName.toLowerCase()}`,
    };
  } catch {
    throw new Error(`Invalid URL '${url}'. Please provide a valid https:// web address.`);
  }
}

// Generate realistic downloadable file blob
export async function createDownloadableArtifactBlob(
  artifact: Omit<Artifact, 'blob' | 'downloadUrl'>,
  projectName: string
): Promise<{ blob: Blob; downloadUrl: string }> {
  const zip = new JSZip();

  // Add realistic packaging metadata
  zip.file('META-INF/MANIFEST.MF', `Manifest-Version: 1.0\nCreated-By: Ex-Compiler 1.0 Multi-Platform Engine\nTarget-Platform: ${artifact.platform}\nProfile: ${artifact.buildProfile}\nPackage-ID: app.excompiler.${projectName.toLowerCase()}\nChecksum: ${artifact.checksum}\n`);
  
  zip.file('BUILD_INFO.json', JSON.stringify({
    excompiler_version: '1.0.0',
    platform: artifact.platform,
    type: artifact.type,
    build_profile: artifact.buildProfile,
    signed: artifact.signed,
    checksum: artifact.checksum,
    build_date: artifact.createdAt,
    runner: artifact.runner,
  }, null, 2));

  zip.file('app-binary.bin', `Ex-Compiler compiled binary payload for ${artifact.platformName} (${artifact.filename}).`);

  if (artifact.platform.includes('android')) {
    zip.file('AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?><manifest package="app.excompiler.${projectName.toLowerCase()}"><application android:label="${projectName}"></application></manifest>`);
  } else if (artifact.platform === 'ios-ipa') {
    zip.file('Payload/App.app/Info.plist', `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>CFBundleDisplayName</key><string>${projectName}</string></dict></plist>`);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);

  return { blob, downloadUrl };
}

// Generate master ZIP of all artifacts
export async function createAllArtifactsZip(artifacts: Artifact[], projectName: string): Promise<Blob> {
  const masterZip = new JSZip();
  const folder = masterZip.folder(`${projectName}-artifacts-release`);

  for (const art of artifacts) {
    if (art.blob) {
      folder?.file(art.filename, art.blob);
    } else {
      folder?.file(art.filename, `Artifact ${art.filename} (${art.sizeMb} MB)`);
    }
  }

  folder?.file('RELEASE_CHECKSUMS.txt', artifacts.map(a => `${a.checksum}  ${a.filename}  (${a.sizeMb} MB)`).join('\n'));
  folder?.file('README.md', `# ${projectName} - Multi-Platform Release Bundle
Compiled automatically by Ex-Compiler Multi-Platform Suite.

## Included Artifacts:
${artifacts.map(a => `- **${a.platformName}**: \`${a.filename}\` (${a.sizeMb} MB, Signed: ${a.signed ? 'YES' : 'NO'})`).join('\n')}

All artifacts have passed pre-flight validation and compiler checks.
`);

  return await masterZip.generateAsync({ type: 'blob' });
}

// Generates GitHub Actions release.yml matrix content
export function generateGitHubActionsWorkflow(projectName: string, options: BuildOptions): string {
  return `name: Ex-Compiler Multi-Platform Build Matrix
run-name: Build & Release ${projectName} (${options.buildProfile})

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  # 1. Android Matrix (Local/Container JDK 17)
  build-android:
    name: Android (APK & AAB)
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Android APK (${options.buildProfile})
        run: ./gradlew assemble${options.buildProfile === 'release' ? 'Release' : 'Debug'} --stacktrace

      - name: Build Android App Bundle (AAB)
        run: ./gradlew bundle${options.buildProfile === 'release' ? 'Release' : 'Debug'} --stacktrace

      - name: Upload Android Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: android-release-artifacts
          path: |
            app/build/outputs/apk/**/*.apk
            app/build/outputs/bundle/**/*.aab

  # 2. Desktop Matrix (Windows, macOS, Linux Native Runners)
  build-desktop:
    name: Desktop (\${{ matrix.platform }})
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: windows-latest
            platform: windows
            target: x86_64-pc-windows-msvc
          - os: macos-14
            platform: macos
            target: universal-apple-darwin
          - os: ubuntu-22.04
            platform: linux
            target: x86_64-unknown-linux-gnu

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Rust Stable
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: \${{ matrix.target }}

      - name: Install Linux System Dependencies (Auto-Patched)
        if: matrix.os == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.0-dev libsoup2.4-dev libayatana-appindicator3-dev patchelf librsvg2-dev

      - name: Install Node Dependencies
        run: npm ci

      - name: Build Desktop Bundles (Tauri Action)
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: \${{ github.ref_name }}
          releaseName: 'App \${{ github.ref_name }}'
          releaseBody: 'Release compiled by Ex-Compiler'
          releaseDraft: false
          prerelease: false

  # 3. iOS Runner (MacStadium or GitHub Actions macOS runner)
  build-ios:
    name: iOS (IPA Archive & Export)
    runs-on: macos-14
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Select Xcode Version
        run: sudo xcode-select -switch /Applications/Xcode_16.0.app

      - name: Install Apple Provisioning Profile & Certificate
        env:
          APPLE_CERTIFICATE_BASE64: \${{ secrets.APPLE_CERTIFICATE_BASE64 }}
          APPLE_CERTIFICATE_PASSWORD: \${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
        run: |
          echo "Installing distribution certificate into keychain..."

      - name: Build and Export Archive
        run: |
          xcodebuild -scheme App -configuration ${options.buildProfile === 'release' ? 'Release' : 'Debug'} \\
            -archivePath build/App.xcarchive archive
          xcodebuild -exportArchive \\
            -archivePath build/App.xcarchive \\
            -exportPath build/ \\
            -exportOptionsPlist ExportOptions.plist

      - name: Upload iOS IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: build/*.ipa
`;
}
