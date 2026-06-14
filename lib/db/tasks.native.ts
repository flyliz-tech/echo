import * as Crypto from "expo-crypto";

import { getDatabase } from "./database";
import {
  CreateTaskInput,
  DEFAULT_RADIUS_METERS,
  Task,
  UpdateTaskInput,
  deriveTriggerType,
} from "../types/task";

interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  trigger_type: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  location_name: string | null;
  trigger_time: string | null;
  is_completed: number;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    triggerType: row.trigger_type as Task["triggerType"],
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius_meters,
    locationName: row.location_name,
    triggerTime: row.trigger_time,
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks ORDER BY created_at DESC"
  );
  return rows.map(rowToTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );
  return row ? rowToTask(row) : null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const triggerType = input.triggerType ?? deriveTriggerType(input);

  const task: Task = {
    id,
    title: input.title.trim(),
    notes: input.notes?.trim() || null,
    triggerType,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    radiusMeters: input.radiusMeters ?? DEFAULT_RADIUS_METERS,
    locationName: input.locationName?.trim() || null,
    triggerTime: input.triggerTime ?? null,
    isCompleted: false,
    createdAt: now,
  };

  await db.runAsync(
    `INSERT INTO tasks (
      id, title, notes, trigger_type, latitude, longitude,
      radius_meters, location_name, trigger_time, is_completed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.notes,
      task.triggerType,
      task.latitude,
      task.longitude,
      task.radiusMeters,
      task.locationName,
      task.triggerTime,
      task.isCompleted ? 1 : 0,
      task.createdAt,
    ]
  );

  return task;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  const existing = await getTaskById(id);
  if (!existing) return null;

  const merged: Task = {
    ...existing,
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
    isCompleted: input.isCompleted ?? existing.isCompleted,
    triggerType:
      input.triggerType ??
      deriveTriggerType({
        latitude:
          input.latitude !== undefined ? input.latitude : existing.latitude,
        longitude:
          input.longitude !== undefined ? input.longitude : existing.longitude,
        triggerTime:
          input.triggerTime !== undefined
            ? input.triggerTime
            : existing.triggerTime,
      }),
  };

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE tasks SET
      title = ?, notes = ?, trigger_type = ?, latitude = ?, longitude = ?,
      radius_meters = ?, location_name = ?, trigger_time = ?, is_completed = ?
    WHERE id = ?`,
    [
      merged.title,
      merged.notes,
      merged.triggerType,
      merged.latitude,
      merged.longitude,
      merged.radiusMeters,
      merged.locationName,
      merged.triggerTime,
      merged.isCompleted ? 1 : 0,
      id,
    ]
  );

  return merged;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
}

export async function seedDevTasks(): Promise<void> {
  const existing = await getAllTasks();
  if (existing.length > 0) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 30, 0, 0);

  await createTask({
    title: "Buy Milk",
    notes: "Nandini 1 ltr",
    triggerType: "time",
    triggerTime: tomorrow.toISOString(),
    locationName: "Navami, Moodbidri",
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
