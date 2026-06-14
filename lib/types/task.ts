export type TriggerType = "location" | "time" | "none";

export type SortMode = "default" | "triggerTime" | "showCompleted";

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
}

export interface CreateTaskInput {
  title: string;
  notes?: string | null;
  triggerType: TriggerType;
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

export function deriveTriggerType(input: {
  latitude?: number | null;
  longitude?: number | null;
  triggerTime?: string | null;
}): TriggerType {
  const hasLocation =
    input.latitude != null && input.longitude != null;
  const hasTime = input.triggerTime != null;

  if (hasLocation) return "location";
  if (hasTime) return "time";
  return "none";
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

  const triggerType = input.triggerType ?? deriveTriggerType(input);
  if (triggerType === "none") {
    return "Add a time or location trigger";
  }
  if (triggerType === "location") {
    if (input.latitude == null || input.longitude == null) {
      return "Pick a location on the map";
    }
  }
  if (triggerType === "time") {
    if (!input.triggerTime) return "Select a date and time";
  }

  return null;
}
