import * as Crypto from "expo-crypto";

import {
  CreateTaskInput,
  DEFAULT_RADIUS_METERS,
  Task,
  UpdateTaskInput,
  deriveTriggerType,
  normalizeTriggerFields,
} from "../types/task";

const tasks: Task[] = [];

export async function getAllTasks(): Promise<Task[]> {
  return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTaskById(id: string): Promise<Task | null> {
  return tasks.find((task) => task.id === id) ?? null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const triggerType = input.triggerType ?? deriveTriggerType(input);
  const triggerFields = normalizeTriggerFields(input, triggerType);

  const task: Task = {
    id,
    title: input.title.trim(),
    notes: input.notes?.trim() || null,
    triggerType,
    latitude: triggerFields.latitude,
    longitude: triggerFields.longitude,
    radiusMeters: input.radiusMeters ?? DEFAULT_RADIUS_METERS,
    locationName: triggerFields.locationName,
    triggerTime: triggerFields.triggerTime,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(task);
  return task;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;

  const existing = tasks[index];
  const mergedInput: CreateTaskInput = {
    title: input.title?.trim() ?? existing.title,
    notes:
      input.notes !== undefined
        ? input.notes?.trim() || null
        : existing.notes,
    latitude: input.latitude !== undefined ? input.latitude : existing.latitude,
    longitude:
      input.longitude !== undefined ? input.longitude : existing.longitude,
    radiusMeters: input.radiusMeters ?? existing.radiusMeters,
    locationName:
      input.locationName !== undefined
        ? input.locationName?.trim() || null
        : existing.locationName,
    triggerTime:
      input.triggerTime !== undefined ? input.triggerTime : existing.triggerTime,
    timeEnabled: input.timeEnabled,
    locationEnabled: input.locationEnabled,
    triggerType: input.triggerType,
  };

  const triggerType =
    mergedInput.triggerType ?? deriveTriggerType(mergedInput);
  const triggerFields = normalizeTriggerFields(mergedInput, triggerType);

  const merged: Task = {
    ...existing,
    title: mergedInput.title!,
    notes: mergedInput.notes ?? null,
    latitude: triggerFields.latitude,
    longitude: triggerFields.longitude,
    radiusMeters: mergedInput.radiusMeters ?? existing.radiusMeters,
    locationName: triggerFields.locationName,
    triggerTime: triggerFields.triggerTime,
    isCompleted: input.isCompleted ?? existing.isCompleted,
    triggerType,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = merged;
  return merged;
}

export async function deleteTask(id: string): Promise<void> {
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) tasks.splice(index, 1);
}

export async function seedDevTasks(): Promise<void> {
  if (tasks.length > 0) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 30, 0, 0);

  await createTask({
    title: "Buy Milk",
    notes: "Nandini 1 ltr",
    triggerType: "time",
    timeEnabled: true,
    triggerTime: tomorrow.toISOString(),
  });

  await createTask({
    title: "Collect Laundry Clothes",
    notes: "List articles when collecting",
    triggerType: "location",
    locationName: "Evershine Laundry, Moodbidri",
    latitude: 13.064,
    longitude: 74.997,
    radiusMeters: 150,
  });
}
