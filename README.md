# Echo

> A contextual, spatial task manager. Tasks echo back when you're in the right place or at the right time.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/platform-Android-brightgreen.svg)](#installation)
[![Version](https://img.shields.io/badge/version-0.0.1--beta-orange.svg)](https://github.com/gautham-prasad/echo/releases)
[![Built with Expo](https://img.shields.io/badge/built%20with-Expo-000020.svg)](https://expo.dev/)

Echo is an offline-first reminders app built with Expo and React Native. Beyond plain to-dos, Echo triggers reminders by **time** or by **location** (geofencing), so a task can resurface the moment you walk into the grocery store or when it's finally due.

> Status: **v0.0.1 beta** — Android only, distributed as a sideloadable APK. See [Releases](https://github.com/gautham-prasad/echo/releases).

## Features

- Offline-first task storage with SQLite — no account required
- Time reminders with local notifications
- Location reminders via geofencing (trigger on arrival within a radius)
- Interactive map picker with place search autocomplete and adjustable radius
- Full-screen map of your location tasks with "recenter on me"
- Calendar view for time-triggered tasks
- Home list with sort modes, search, quick-complete, and multi-select delete
- 10-second undo on delete
- Light and dark themes

## Screenshots

<!-- Add screenshots here, e.g. docs/assets/home.png, map.png, calendar.png -->
_Screenshots coming soon._

## Tech Stack

- **UI / Navigation**: React Native 0.81, Expo 54, [Expo Router](https://docs.expo.dev/router/introduction/)
- **State**: [Zustand](https://github.com/pmndrs/zustand) — [`lib/store/taskStore.ts`](lib/store/taskStore.ts)
- **Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — [`lib/db/`](lib/db/)
- **Maps**: [MapLibre](https://maplibre.org/) with free [OpenFreeMap](https://openfreemap.org/) tiles (no API key)
- **Geocoding**: keyless [Photon](https://photon.komoot.io/) (OpenStreetMap) — [`lib/services/geocoding.ts`](lib/services/geocoding.ts)
- **Geofencing**: expo-location + expo-task-manager — [`lib/services/geofencing.ts`](lib/services/geofencing.ts)
- **Notifications**: expo-notifications — [`lib/services/notifications.ts`](lib/services/notifications.ts)

## Quick Start (Development)

```bash
git clone https://github.com/gautham-prasad/echo.git
cd echo
npm install
npm start
```

For native features (maps, geofencing, notifications) run on Android:

```bash
npm run android:prebuild   # regenerate the native project
npm run android            # build and run on a connected device/emulator
```

Geofencing should be tested on a **physical Android device** — emulators are unreliable for region events.

Full setup and build-from-source steps: [Docs/INSTALLATION.md](Docs/INSTALLATION.md).

## Install the App (Users)

1. Download the latest `echo-vX.Y.Z.apk` from [Releases](https://github.com/gautham-prasad/echo/releases).
2. On your Android device, allow installing from unknown sources when prompted.
3. Open the APK to install, then grant location and notification permissions.

Step-by-step guide: [Docs/USER_GUIDE.md](Docs/USER_GUIDE.md).

## Permissions

Echo requests:

- **Foreground location** — map pin picker and map view
- **Background location** — geofence triggers when the app is closed
- **Notifications** — time and location reminders

## Build Commands

- `npm start` — start the Expo dev server
- `npm run android` — run on an Android device/emulator
- `npm run android:prebuild` — regenerate the native Android project
- `npm run android:prod` — build a release APK (`android/app/build/outputs/apk/release/app-release.apk`)
- `npm run android:dev:install` — install the debug APK via adb
- `npm run android:prod:install` — install the release APK via adb
- `npm run lint` — run the linter

## Architecture

```
app/            Expo Router screens (tabs, task view/edit, settings)
components/     Reusable UI (TaskForm, ScreenHeader, map + location pickers, etc.)
lib/store/      Zustand state (taskStore, themeStore)
lib/db/         SQLite access + schema/migrations (native) and in-memory (web)
lib/services/   geocoding, geofencing, notifications
lib/types/      shared types
constants/      theme tokens (colors, spacing, radius, typography)
hooks/          useTheme and others
```

## Roadmap

- Proper release signing + Google Play distribution
- iOS release
- Supabase auth and cloud sync
- OTA updates
- Premium features (custom audio, notification stacking)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the dev setup, branch model, and PR process.

## License

[MIT](LICENSE) © Gautham Prasad

## Attribution

- Map tiles © [OpenFreeMap](https://openfreemap.org/) and [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Geocoding by [Photon](https://photon.komoot.io/), data © OpenStreetMap contributors.
