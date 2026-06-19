export type TriggerType = "location" | "time" | "both" | "none";

export type Priority = "low" | "medium" | "high" | "urgent";

export type SortMode =
  | "default"
  | "triggerTime"
  | "location"
  | "showCompleted";

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  triggerType: TriggerType;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  locationName: string | null;
  triggerTime: string | null;
  priority: Priority;
  isCompleted: boolean;
  /** ISO timestamp of the most recent completion, or null if never completed. */
  completedAt: string | null;
  /** ISO timestamp of the most recent reopen, or null if not currently reopened. */
  reopenedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  notes?: string | null;
  triggerType?: TriggerType;
  timeEnabled?: boolean;
  locationEnabled?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number;
  locationName?: string | null;
  triggerTime?: string | null;
  priority?: Priority;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  isCompleted?: boolean;
}

export const DEFAULT_PRIORITY: Priority = "low";

/** Ordered low → urgent, for rendering selectors and badges. */
export const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

/** Display metadata per priority: label, emoji, and a text/accent colour. */
export const PRIORITY_META: Record<
  Priority,
  { label: string; emoji: string; color: string }
> = {
  low: { label: "Low", emoji: "🟢", color: "#16A34A" },
  medium: { label: "Medium", emoji: "🟡", color: "#D97706" },
  high: { label: "High", emoji: "🟠", color: "#EA580C" },
  urgent: { label: "Urgent", emoji: "🔴", color: "#DC2626" },
};

export const TITLE_MAX_LENGTH = 150;
export const NOTES_MAX_LENGTH = 500;
export const DEFAULT_RADIUS_METERS = 150;
export const MIN_RADIUS_METERS = 50;
export const MAX_RADIUS_METERS = 500;

export function hasTimeTrigger(task: Pick<Task, "triggerType">): boolean {
  return task.triggerType === "time" || task.triggerType === "both";
}

export function hasLocationTrigger(task: Pick<Task, "triggerType">): boolean {
  return task.triggerType === "location" || task.triggerType === "both";
}

export function deriveTriggerType(input: {
  timeEnabled?: boolean;
  locationEnabled?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  triggerTime?: string | null;
}): TriggerType {
  const locationOn =
    input.locationEnabled === true ||
    (input.locationEnabled !== false &&
      input.latitude != null &&
      input.longitude != null);
  const timeOn =
    input.timeEnabled === true ||
    (input.timeEnabled !== false && input.triggerTime != null);

  const hasLocation =
    locationOn && input.latitude != null && input.longitude != null;
  const hasTime = timeOn && input.triggerTime != null;

  if (hasLocation && hasTime) return "both";
  if (hasLocation) return "location";
  if (hasTime) return "time";
  return "none";
}

export function normalizeTriggerFields(
  input: CreateTaskInput,
  triggerType: TriggerType
): Pick<
  Task,
  "triggerTime" | "latitude" | "longitude" | "locationName"
> {
  const timeActive = triggerType === "time" || triggerType === "both";
  const locationActive = triggerType === "location" || triggerType === "both";

  return {
    triggerTime: timeActive ? input.triggerTime ?? null : null,
    latitude: locationActive ? input.latitude ?? null : null,
    longitude: locationActive ? input.longitude ?? null : null,
    locationName: locationActive
      ? input.locationName?.trim() || null
      : null,
  };
}

/**
 * Resolves the completion-related fields for a task update.
 *
 * - Completing (false -> true): records `completedAt` and clears `reopenedAt`.
 * - Reopening (true -> false): records `reopenedAt` while preserving
 *   `completedAt` so the previously-closed date stays visible.
 * - No completion change: leaves all three fields untouched.
 */
export function resolveCompletion(
  existing: Pick<Task, "isCompleted" | "completedAt" | "reopenedAt">,
  nextIsCompleted: boolean | undefined,
  now: string
): Pick<Task, "isCompleted" | "completedAt" | "reopenedAt"> {
  if (nextIsCompleted === undefined || nextIsCompleted === existing.isCompleted) {
    return {
      isCompleted: existing.isCompleted,
      completedAt: existing.completedAt,
      reopenedAt: existing.reopenedAt,
    };
  }

  if (nextIsCompleted) {
    return { isCompleted: true, completedAt: now, reopenedAt: null };
  }

  return {
    isCompleted: false,
    completedAt: existing.completedAt,
    reopenedAt: now,
  };
}

export function validateTaskInput(input: CreateTaskInput): string | null {
  const title = input.title.trim();
  if (!title) return "Title is required";
  if (title.length > TITLE_MAX_LENGTH) {
    return `Title must be ${TITLE_MAX_LENGTH} characters or less`;
  }
  if (input.notes && input.notes.length > NOTES_MAX_LENGTH) {
    return `Notes must be ${NOTES_MAX_LENGTH} characters or less`;
  }

  const timeEnabled = input.timeEnabled ?? input.triggerTime != null;
  const locationEnabled =
    input.locationEnabled ??
    (input.latitude != null && input.longitude != null);

  const triggerType =
    input.triggerType ??
    deriveTriggerType({
      timeEnabled,
      locationEnabled,
      latitude: input.latitude,
      longitude: input.longitude,
      triggerTime: input.triggerTime,
    });

  if (timeEnabled && !input.triggerTime) {
    return "Select a date and time";
  }
  if (
    locationEnabled &&
    (input.latitude == null || input.longitude == null)
  ) {
    return "Pick a location on the map";
  }

  if (triggerType === "time" && !input.triggerTime) {
    return "Select a date and time";
  }
  if (
    triggerType === "location" &&
    (input.latitude == null || input.longitude == null)
  ) {
    return "Pick a location on the map";
  }

  return null;
}
