# Installation

Echo `v0.0.1` is currently distributed as an Android sideload APK. This guide covers both installing the prebuilt app and building from source.

iOS beta will be shared soon as a sideloadable build. Official store distribution is planned for v1.

## Option A: Install the prebuilt APK (recommended for users)

1. Open [Releases](https://github.com/flyliz-tech/echo/releases) on your Android phone.
2. Download the latest `echo-vX.Y.Z.apk` asset.
3. When prompted, allow your browser/file manager to **install unknown apps** (Settings -> Apps -> Special access -> Install unknown apps).
4. Tap the downloaded APK and confirm the install.
5. Launch Echo and grant the requested **location** and **notification** permissions (required for reminders to work).

> The beta APK is signed with a debug key. If a future release is signed with a different key, you may need to uninstall the old version before updating.

## Option B: Build from source (developers)

### Prerequisites

- Node.js 18+ and npm
- Android Studio with the Android SDK and platform tools (`adb` on your PATH)
- A JDK (17+)
- A connected Android device (USB debugging enabled) or an emulator

### Steps

```bash
git clone https://github.com/flyliz-tech/echo.git
cd echo
npm install

# Generate the native Android project
npm run android:prebuild

# Build and run on a connected device/emulator
npm run android
```

### Build a release APK

```bash
npm run android:prod
```

The APK is written to:

```
android/app/build/outputs/apk/release/app-release.apk
```

Install it directly via:

```bash
npm run android:prod:install
```

## Troubleshooting

- **Geofencing doesn't trigger**: test on a physical device; emulators are unreliable for region monitoring. Ensure background location permission is granted ("Allow all the time").
- **No notifications**: confirm notification permission is granted and battery optimization isn't killing the app.
- **Map is blank**: check your internet connection — tiles load from OpenFreeMap.
- **`adb` not found**: install Android platform-tools and add them to your PATH.

## Web (limited)

`npm run web` runs a limited web build for UI work. Native features (maps, geofencing, notifications) are unavailable on web.
