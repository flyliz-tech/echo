import {
  SortMode,
  Task,
  hasLocationTrigger,
  hasTimeTrigger,
} from "@/lib/types/task";

/**
 * Orders tasks for a given sort mode. Pure and free of native/store imports so
 * it can be unit-tested in isolation.
 *
 * - `triggerTime`: incomplete, time-triggered tasks ascending by trigger time.
 * - `location`: incomplete, location-triggered tasks, newest first.
 * - `showCompleted`: only completed tasks, newest first.
 * - `default`: incomplete first then completed, each newest first.
 */
export function sortTasks(tasks: Task[], sortMode: SortMode): Task[] {
  if (sortMode === "showCompleted") {
    return tasks
      .filter((t) => t.isCompleted)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  if (sortMode === "triggerTime") {
    return tasks
      .filter((t) => !t.isCompleted && hasTimeTrigger(t) && t.triggerTime)
      .sort((a, b) => a.triggerTime!.localeCompare(b.triggerTime!));
  }

  if (sortMode === "location") {
    return tasks
      .filter((t) => !t.isCompleted && hasLocationTrigger(t))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const byNewest = (a: Task, b: Task) => b.createdAt.localeCompare(a.createdAt);
  const incomplete = tasks.filter((t) => !t.isCompleted).sort(byNewest);
  const completed = tasks.filter((t) => t.isCompleted).sort(byNewest);
  return [...incomplete, ...completed];
}

/** Case-insensitive match against title, notes, and location name. */
export function filterTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;

  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.notes?.toLowerCase().includes(q) ?? false) ||
      (t.locationName?.toLowerCase().includes(q) ?? false)
  );
}

/** Sort first, then apply the active search query. */
export function selectVisibleTasks(
  tasks: Task[],
  sortMode: SortMode,
  query: string
): Task[] {
  return filterTasks(sortTasks(tasks, sortMode), query);
}
