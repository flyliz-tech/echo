import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { getAllTasks } from "@/lib/db/tasks";
import { Task } from "@/lib/types/task";
import { notifyGeofenceEntry } from "@/lib/services/notifications";

export const GEOFENCE_TASK_NAME = "echo-geofence-task";
const MAX_GEOFENCES = 100;

TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Geofence task error:", error);
    return;
  }

  const event = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  if (event.eventType === Location.GeofencingEventType.Enter) {
    const taskId = event.region.identifier;
    if (taskId) {
      await notifyGeofenceEntry(taskId);
    }
  }
});

function taskToRegion(task: Task): Location.LocationRegion | null {
  if (
    task.triggerType !== "location" ||
    task.isCompleted ||
    task.latitude == null ||
    task.longitude == null
  ) {
    return null;
  }

  return {
    identifier: task.id,
    latitude: task.latitude,
    longitude: task.longitude,
    radius: task.radiusMeters,
    notifyOnEnter: true,
    notifyOnExit: false,
  };
}

export async function syncGeofences(): Promise<void> {

  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== "granted") return;

  const tasks = await getAllTasks();
  const regions = tasks
    .map(taskToRegion)
    .filter((r): r is Location.LocationRegion => r != null)
    .slice(0, MAX_GEOFENCES);

  const isRunning = await Location.hasStartedGeofencingAsync(
    GEOFENCE_TASK_NAME
  );

  if (regions.length === 0) {
    if (isRunning) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
    }
    return;
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();

  if (backgroundStatus !== "granted") {
    if (__DEV__) {
      console.warn("Background location not granted; geofencing limited");
    }
    return;
  }

  if (isRunning) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
  }

  await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
}

export async function requestLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();

  return {
    foreground: foregroundStatus === "granted",
    background: backgroundStatus === "granted",
  };
}

export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
