import { getAllTasks, getTaskById } from "@/lib/db/tasks";
import { Task, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";

export function scheduledTimeNotificationBody(task: Task): string {
  if (task.notes?.trim()) return task.notes.trim();
  return "It's time for this task";
}

export function locationArrivalNotificationBody(task: Task): string {
  if (task.notes?.trim()) return task.notes.trim();
  if (task.locationName?.trim()) {
    return `You've arrived at ${task.locationName.trim()}`;
  }
  return "You're within range of your task location";
}

export function notificationTitle(task: Task, kind: "time" | "location"): string {
  if (kind === "time" && task.triggerTime) {
    return `${task.title} · ${formatTriggerTime(task.triggerTime)}`;
  }
  if (kind === "location" && task.locationName?.trim()) {
    return `${task.title} · ${task.locationName.trim()}`;
  }
  return task.title;
}

export { hasLocationTrigger, hasTimeTrigger, getTaskById, getAllTasks };
