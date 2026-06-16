export const GEOFENCE_TASK_NAME = "echo-geofence-task";

export async function syncGeofences(): Promise<void> {}

export async function requestLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  return { foreground: false, background: false };
}

export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  return null;
}
