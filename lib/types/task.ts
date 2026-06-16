export type TriggerType = "location" | "time" | "both" | "none";

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
  isCompleted: boolean;
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
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  isCompleted?: boolean;
}

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
