import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getAllTasks, getTaskById } from "@/lib/db/tasks";
import { Task } from "@/lib/types/task";

const NOTIFICATION_PREFIX = "echo-task-";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function notificationId(taskId: string): string {
  return `${NOTIFICATION_PREFIX}${taskId}`;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Echo Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleTimeNotification(task: Task): Promise<void> {
  if (task.triggerType !== "time" || !task.triggerTime || task.isCompleted) {
    return;
  }

  const triggerDate = new Date(task.triggerTime);
  if (triggerDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId(task.id),
    content: {
      title: task.title,
      body: task.notes || "Time to complete your task",
      data: { taskId: task.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

async function cancelTaskNotification(taskId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    notificationId(taskId)
  );
}

export async function notifyGeofenceEntry(taskId: string): Promise<void> {
  const task = await getTaskById(taskId);
  if (!task || task.isCompleted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `${notificationId(taskId)}-geofence`,
    content: {
      title: task.title,
      body: task.locationName
        ? `You're near ${task.locationName}`
        : "You've arrived at your task location",
      data: { taskId: task.id },
    },
    trigger: null,
  });
}

export async function syncNotifications(): Promise<void> {
  const tasks = await getAllTasks();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const echoScheduled = scheduled.filter((n) =>
    n.identifier.startsWith(NOTIFICATION_PREFIX)
  );

  for (const notification of echoScheduled) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }

  const hasTimeTasks = tasks.some(
    (t) => t.triggerType === "time" && !t.isCompleted && t.triggerTime
  );

  if (hasTimeTasks) {
    await requestNotificationPermissions();
  }

  for (const task of tasks) {
    if (task.triggerType === "time" && !task.isCompleted) {
      await scheduleTimeNotification(task);
    } else {
      await cancelTaskNotification(task.id);
    }
  }
}

export function setupNotificationResponseHandler(
  onTaskPress: (taskId: string) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const taskId = response.notification.request.content.data?.taskId;
      if (typeof taskId === "string") {
        onTaskPress(taskId);
      }
    }
  );

  return () => subscription.remove();
}
