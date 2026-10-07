# Jisr (جِسر) — Android Distribution & Build Directory

[![Platform: Android](https://img.shields.io/badge/Platform-Android_7.0%2B-brightgreen.svg)](https://developer.android.com)
[![Package: com.ai4ly.jisr](https://img.shields.io/badge/Package-com.ai4ly.jisr-teal.svg)](https://github.com/Ai4LY/Jisr)
[![Build: APK Preview](https://img.shields.io/badge/Build-Standalone_APK-blue.svg)](../eas.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

This directory serves as the dedicated distribution and build output directory for compiled standalone Android APK artifacts of **Jisr (جِسر)**, the privacy-first mental health writing companion for Libyan youth.

---

## 📦 Package Specifications

| Attribute | Specification |
|---|---|
| **Application Name** | Jisr (جِسر) |
| **Package Identifier** | `com.ai4ly.jisr` |
| **Version Name** | `1.0.0` |
| **Version Code** | `1` |
| **Artifact Path** | `builds/jisr-v1.0.0.apk` |
| **Minimum Android SDK** | API Level 24 (Android 7.0 Nougat) |
| **Target Android SDK** | API Level 34 (Android 14) |
| **Architecture** | Universal APK (arm64-v8a, armeabi-v7a, x86_64) |
| **Framework & Engine** | React Native 0.74.5 / Expo SDK 51 (Metro Bundler) |
| **Build Configuration** | Standalone APK (`eas.json` preview profile) |

---

## 📥 Downloading the Compiled Release APK

Evaluators and testers have two primary channels to acquire the compiled Android package:

### 1. Download from GitHub Releases (Recommended for Evaluators)
Official compiled release builds are automatically generated and published by the GitHub Actions CI pipeline:
1. Navigate to the [Jisr GitHub Releases page](https://github.com/Ai4LY/Jisr/releases).
2. Under the latest release (e.g. `v1.0.0`), download the release asset:
   - `jisr-v1.0.0.apk`
   - `jisr-v1.0.0.apk.sha256` (checksum verification file)

### 2. Local Repository Builds Directory
When compiled locally or cloned with artifacts, the standalone APK artifact is hosted directly at:
```text
builds/jisr-v1.0.0.apk
```

---

## 🔒 Verification & Checksums

Always verify the integrity of the downloaded APK prior to installation:

```bash
# Verify SHA-256 Checksum on Linux / macOS
sha256sum builds/jisr-v1.0.0.apk

# Verify SHA-256 Checksum on Windows (PowerShell)
Get-FileHash builds/jisr-v1.0.0.apk -Algorithm SHA256
```

Compare the computed hash with `builds/jisr-v1.0.0.apk.sha256` published with the release asset.

---

## 📲 Installation Instructions

Once you have acquired the compiled release APK:

### Option 1: Direct Device Sideloading
1. Transfer `jisr-v1.0.0.apk` to your Android device via USB, direct browser download, or file transfer.
2. Open your device's **Files** or **Downloads** app and tap `jisr-v1.0.0.apk`.
3. If prompted with *"Install unknown apps"*, tap **Settings** and enable **Allow from this source**.
4. Confirm installation by tapping **Install**, then tap **Open**.

### Option 2: Installation via Android Debug Bridge (ADB)
Ensure developer options and USB debugging are enabled on your test device or emulator:

```bash
# Verify connected device or emulator
adb devices

# Install APK onto connected device
adb install -r builds/jisr-v1.0.0.apk

# Launch Jisr main activity
adb shell am start -n com.ai4ly.jisr/.MainActivity
```

---

## 🏗️ Building the APK from Source

Developers can compile a fresh Android APK from source using either Expo Application Services (EAS Build) or Expo Prebuild with Android Gradle.

### Prerequisites
- Node.js 20+
- JDK 17 (Java Development Kit)
- Android SDK with platform-tools and build-tools (for local Gradle builds)

### Method 1: EAS Build (Cloud or Local Container)
EAS Build utilizes the configuration in `eas.json` (under the `preview` profile):

```bash
# 1. Install dependencies
npm install

# 2. Build via EAS CLI
npx eas-cli build --profile preview --platform android

# 3. Or trigger a local build container using EAS CLI:
npx eas-cli build --profile preview --platform android --local --output builds/jisr-v1.0.0.apk
```

### Method 2: Expo Prebuild + Gradle Assemble
To compile directly on an Android development machine:

```bash
# 1. Install dependencies
npm install

# 2. Generate native Android project files
npx expo prebuild --platform android --clean

# 3. Assemble Release APK with Gradle
cd android

# On Linux / macOS:
chmod +x gradlew
./gradlew assembleRelease --no-daemon

# On Windows:
.\gradlew.bat assembleRelease --no-daemon

# 4. Copy generated APK to the builds directory
cd ..
cp android/app/build/outputs/apk/release/*.apk builds/jisr-v1.0.0.apk
```

### Method 3: Automated GitHub Actions CI Pipeline
Every push to `main` or release tag triggers the genuine automated build pipeline at `.github/workflows/build-apk.yml`. The workflow:
1. Runs all unit tests and safety benchmarks (`npm test`).
2. Configures Node 20, Java 17, and Android SDK.
3. Compiles the Android APK via EAS CLI / Gradle assemble.
4. Generates SHA-256 checksums.
5. Publishes the asset to GitHub Releases and saves build artifacts.

---

## 🛡️ Permissions & Privacy Guarantee

Jisr operates strictly under privacy-by-design principles:

| Permission | Purpose |
|---|---|
| `android.permission.INTERNET` | Optional stateless communication with the FastAPI backend (`/api/check-risk`, `/api/generate-drafts`). |
| `android.permission.ACCESS_NETWORK_STATE` | Detects network connectivity to smoothly trigger local offline template fallback. |

### Zero-Telemetry Architecture
- **No Analytics SDKs**: Zero trackers, advertising identifiers, or analytics libraries.
- **Zero Cloud Sync for Personal Data**: Distress chips and draft histories are sandboxed locally in `AsyncStorage`.
- **One-Tap Wipe**: Complete erasure of sandboxed device state with a single tap.
- **Offline Autonomous Fallback**: Fully functional offline drafting using `safety/plain-templates.json` when disconnected.
