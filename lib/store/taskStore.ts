import { create } from "zustand";

import * as taskDb from "@/lib/db/tasks";
import { syncGeofences } from "@/lib/services/geofencing";
import { syncNotifications } from "@/lib/services/notifications";
import {
  CreateTaskInput,
  SortMode,
  Task,
  UpdateTaskInput,
} from "@/lib/types/task";

interface PendingDelete {
  task: Task;
  timeoutId: ReturnType<typeof setTimeout>;
}

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  isInitialized: boolean;
  sortMode: SortMode;
  searchQuery: string;
  pendingDelete: PendingDelete | null;

  initialize: () => Promise<void>;
  setSortMode: (mode: SortMode) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTasks: () => Task[];

  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task | null>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTaskWithUndo: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

function sortTasks(tasks: Task[], sortMode: SortMode): Task[] {
  const incomplete = tasks.filter((t) => !t.isCompleted);
  const completed = tasks.filter((t) => t.isCompleted);

  const sortIncomplete = (list: Task[]): Task[] => {
    if (sortMode === "triggerTime") {
      return [...list].sort((a, b) => {
        if (!a.triggerTime && !b.triggerTime) return 0;
        if (!a.triggerTime) return 1;
        if (!b.triggerTime) return -1;
        return a.triggerTime.localeCompare(b.triggerTime);
      });
    }
    return [...list].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    );
  };

  const sortedIncomplete = sortIncomplete(incomplete);
  const sortedCompleted = sortIncomplete(completed);

  if (sortMode === "showCompleted") {
    return [...sortedIncomplete, ...sortedCompleted];
  }

  return sortedIncomplete;
}

function filterTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;

  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.notes?.toLowerCase().includes(q) ?? false) ||
      (t.locationName?.toLowerCase().includes(q) ?? false)
  );
}

async function syncTriggers(): Promise<void> {
  await Promise.all([syncGeofences(), syncNotifications()]);
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  isInitialized: false,
  sortMode: "default",
  searchQuery: "",
  pendingDelete: null,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      await taskDb.seedDevTasks();
      const tasks = await taskDb.getAllTasks();
      set({ tasks, isInitialized: true });
      await syncTriggers();
    } finally {
      set({ isLoading: false });
    }
  },

  setSortMode: (mode) => set({ sortMode: mode }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredTasks: () => {
    const { tasks, sortMode, searchQuery } = get();
    const sorted = sortTasks(tasks, sortMode);
    return filterTasks(sorted, searchQuery);
  },

  createTask: async (input) => {
    const task = await taskDb.createTask(input);
    set({ tasks: [task, ...get().tasks] });
    await syncTriggers();
    return task;
  },

  updateTask: async (id, input) => {
    const updated = await taskDb.updateTask(id, input);
    if (!updated) return null;
    set({
      tasks: get().tasks.map((t) => (t.id === id ? updated : t)),
    });
    await syncTriggers();
    return updated;
  },

  toggleComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    await get().updateTask(id, { isCompleted: !task.isCompleted });
  },

  deleteTaskWithUndo: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const existing = get().pendingDelete;
    if (existing) {
      clearTimeout(existing.timeoutId);
      await taskDb.deleteTask(existing.task.id);
      await syncTriggers();
    }

    set({ tasks: get().tasks.filter((t) => t.id !== id) });

    const timeoutId = setTimeout(async () => {
      await taskDb.deleteTask(id);
      await syncTriggers();
      set({ pendingDelete: null });
    }, 10000);

    set({ pendingDelete: { task, timeoutId } });
  },

  undoDelete: async () => {
    const pending = get().pendingDelete;
    if (!pending) return;

    clearTimeout(pending.timeoutId);
    set({
      tasks: [pending.task, ...get().tasks],
      pendingDelete: null,
    });
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),
}));
