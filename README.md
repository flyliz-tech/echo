# Echo

A contextual spatial task manager built with Expo. Tasks echo back when you're in the right place or at the right time.

## Features (MVP)

- Offline-first task storage with SQLite
- Home list with sort modes, search, and quick-complete
- Create / view / edit / delete tasks with 10-second undo
- Full-screen map with location-task pins
- Calendar view for time-triggered tasks
- Android geofencing and local notifications

## Get Started

```bash
npm install
npm start
```

For Android native features (maps, geofencing, notifications):

```bash
npm run android:prebuild
npm run android
```

Maps use [MapLibre](https://maplibre.org/) with free [OpenFreeMap](https://openfreemap.org/) tiles — no API key required.

## Android Permissions

Echo requests:

- **Foreground location** — map pin picker and map view
- **Background location** — geofence triggers when the app is closed
- **Notifications** — time and location reminders

Test geofencing on a **physical Android device**; emulators are unreliable for region events.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android device/emulator |
| `npm run android:prebuild` | Regenerate native Android project |
| `npm run android:prod` | Build release APK |
| `npm run android:dev:install` | Install debug APK via adb |
| `npm run android:prod:install` | Install release APK via adb |

## Architecture

- **UI**: Expo Router, React Native
- **State**: Zustand ([`lib/store/taskStore.ts`](lib/store/taskStore.ts))
- **Database**: expo-sqlite ([`lib/db/`](lib/db/))
- **Geofencing**: expo-location + expo-task-manager ([`lib/services/geofencing.ts`](lib/services/geofencing.ts))
- **Notifications**: expo-notifications ([`lib/services/notifications.ts`](lib/services/notifications.ts))

## Deferred (Phase 2+)

- Supabase auth and cloud sync
- OTA updates via hot-updater
- V3 premium features (custom audio, notification stacking, voice calls)
