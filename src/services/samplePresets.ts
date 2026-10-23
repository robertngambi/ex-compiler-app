import { DiagnosticError, ProjectAnalysis } from '../types';

export interface SamplePreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'Android' | 'Web URL' | 'Desktop Tauri' | 'React Native';
  type: ProjectAnalysis['detectedType'];
  sampleUrl?: string;
  files: Record<string, string>;
  injectedError?: Omit<DiagnosticError, 'id' | 'timestamp'>;
  description: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'broken-kotlin-compose',
    name: 'Broken Kotlin Jetpack Compose Project',
    subtitle: 'Unresolved import & deprecated Gradle 7.4 with Java 17',
    category: 'Android',
    type: 'android-kotlin',
    description: 'Realistic Android Compose project containing a missing Material 3 CardDefaults import and Gradle wrapper JDK 17 incompatibility. Triggers compiler error parsing, diagnostic classification, and unified diff auto-patching.',
    files: {
      'app/build.gradle.kts': `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.excompiler.sample"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.excompiler.sample"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.09.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
}`,
      'app/src/main/java/com/excompiler/sample/MainActivity.kt': `package com.excompiler.sample

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.Card
// BUG: CardDefaults is referenced below but missing from imports
import androidx.compose.runtime.Composable

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface {
                    GreetingCard("Ex-Compiler Android Demo")
                }
            }
        }
    }
}

@Composable
fun GreetingCard(name: String) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp) // ERROR: Unresolved reference: CardDefaults, dp
    ) {
        Text(text = "Hello, $name!")
    }
}`,
      'gradle/wrapper/gradle-wrapper.properties': `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-7.4-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
    },
    injectedError: {
      platform: 'android-apk',
      file: 'app/src/main/java/com/excompiler/sample/MainActivity.kt',
      line: 32,
      errorCode: 'e: [kapt] /app/src/main/java/com/excompiler/sample/MainActivity.kt: (32, 21): Unresolved reference: CardDefaults',
      category: 'syntax_error',
      message: 'Unresolved reference: CardDefaults and dp units in Compose card elevation definition.',
      rootCause: "MainActivity.kt calls 'CardDefaults.cardElevation(defaultElevation = 6.dp)' without importing 'androidx.compose.material3.CardDefaults' and 'androidx.compose.ui.unit.dp'.",
      proposedDiff: `--- a/app/src/main/java/com/excompiler/sample/MainActivity.kt
+++ b/app/src/main/java/com/excompiler/sample/MainActivity.kt
@@ -7,4 +7,6 @@ import androidx.compose.material3.MaterialTheme
 import androidx.compose.material3.Surface
 import androidx.compose.material3.Text
 import androidx.compose.material3.Card
+import androidx.compose.material3.CardDefaults
+import androidx.compose.ui.unit.dp
 import androidx.compose.runtime.Composable`,
      status: 'detected',
      attempts: 0,
      manualInstructions: "Add `import androidx.compose.material3.CardDefaults` and `import androidx.compose.ui.unit.dp` to MainActivity.kt.",
    },
  },
  {
    id: 'hosted-vercel-dashboard',
    name: 'Live Vercel SaaS App (Hosted URL)',
    subtitle: 'https://acme-analytics-portal.vercel.app',
    category: 'Web URL',
    type: 'web-url',
    sampleUrl: 'https://acme-analytics-portal.vercel.app',
    description: 'A production web app URL analyzed as a WebView wrapper candidate. Automatically provisions Capacitor native bridge for Android & iOS and Tauri container for Windows, macOS, and Linux.',
    files: {
      'capacitor.config.json': `{
  "appId": "app.vercel.acmeanalytics",
  "appName": "Acme Analytics",
  "webDir": "dist",
  "server": {
    "url": "https://acme-analytics-portal.vercel.app",
    "cleartext": false
  }
}`,
      'src-tauri/tauri.conf.json': `{
  "package": {
    "productName": "Acme Analytics",
    "version": "1.4.0"
  },
  "build": {
    "beforeDevCommand": "",
    "beforeBuildCommand": "",
    "devPath": "https://acme-analytics-portal.vercel.app",
    "distDir": "https://acme-analytics-portal.vercel.app"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["all"],
      "identifier": "com.acme.analytics"
    }
  }
}`,
    },
  },
  {
    id: 'tauri-desktop-missing-webkit',
    name: 'Tauri Desktop App (Missing Linux WebKit)',
    subtitle: 'Missing libwebkit2gtk-4.0-dev on Ubuntu runner',
    category: 'Desktop Tauri',
    type: 'tauri',
    description: 'Cross-platform Rust/Tauri desktop app that encounters missing WebKitGTK and libayatana-appindicator3 on Linux CI matrix. Compiler auto-detects missing OS libraries and updates workflow.',
    files: {
      'src-tauri/Cargo.toml': `[package]
name = "tauri-forge-desktop"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "1.5", features = ["shell-open", "system-tray"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"`,
      '.github/workflows/release.yml': `name: Release
on: [push]
jobs:
  build:
    runs-on: \${{ matrix.platform }}
    strategy:
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-22.04]
    steps:
      - uses: actions/checkout@v4
      - run: npm run build`,
    },
    injectedError: {
      platform: 'linux-appimage',
      file: '.github/workflows/release.yml',
      line: 14,
      errorCode: "error: failed to run custom build command for `javascriptcore-rs-sys v0.4.0`: package 'webkit2gtk-4.0' not found",
      category: 'missing_dependency',
      message: "Package 'webkit2gtk-4.0' or 'libayatana-appindicator3-dev' not found in pkg-config search path.",
      rootCause: "Tauri requires Linux development libraries (libwebkit2gtk-4.0-dev, libsoup2.4-dev, libayatana-appindicator3-dev) installed via apt-get before cargo build.",
      proposedDiff: `--- a/.github/workflows/release.yml
+++ b/.github/workflows/release.yml
@@ -10,6 +10,10 @@ jobs:
     steps:
       - uses: actions/checkout@v4
+      - name: Install Linux build dependencies
+        if: matrix.platform == 'ubuntu-22.04'
+        run: |
+          sudo apt-get update && sudo apt-get install -y libwebkit2gtk-4.0-dev libsoup2.4-dev libayatana-appindicator3-dev patchelf librsvg2-dev
       - run: npm run build`,
      status: 'detected',
      attempts: 0,
      manualInstructions: "Add `sudo apt-get install -y libwebkit2gtk-4.0-dev libsoup2.4-dev libayatana-appindicator3-dev` to the GitHub Actions ubuntu runner job.",
    },
  },
  {
    id: 'react-native-ios-signing',
    name: 'iOS App (Provisioning Profile Mismatch)',
    subtitle: 'Invalid ExportOptions.plist team ID & certificate',
    category: 'React Native',
    type: 'ios-swift',
    description: 'iOS project archive with expired provisioning profile and missing ExportOptions.plist distribution team ID. Demonstrates signing diagnosis and automatic plist configuration repair.',
    files: {
      'ios/ExportOptions.plist': `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <!-- Missing signingCertificate and teamID -->
</dict>
</plist>`,
    },
    injectedError: {
      platform: 'ios-ipa',
      file: 'ios/ExportOptions.plist',
      line: 6,
      errorCode: 'error: exportArchive: "App.app" requires a provisioning profile with the Push Notifications and Associated Domains features.',
      category: 'signing_error',
      message: 'Code signing failed: No profile matching Team ID or configured Bundle ID found.',
      rootCause: "ExportOptions.plist is missing 'teamID' and distribution signing configuration for release export.",
      proposedDiff: `--- a/ios/ExportOptions.plist
+++ b/ios/ExportOptions.plist
@@ -4,4 +4,7 @@
 <dict>
     <key>method</key>
     <string>app-store</string>
+    <key>teamID</key>
+    <string>A679Z84F3K</string>
+    <key>signingStyle</key>
+    <string>automatic</string>
 </dict>
 </plist>`,
      status: 'detected',
      attempts: 0,
      manualInstructions: "Update ExportOptions.plist with your 10-character Apple Developer Team ID and set signingStyle to automatic.",
    },
  },
];
