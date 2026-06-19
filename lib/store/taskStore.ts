import { create } from "zustand";

import * as taskDb from "@/lib/db/tasks";
import { syncGeofences } from "@/lib/services/geofencing";
import { syncNotifications } from "@/lib/services/notifications";
import {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from "@/lib/types/task";

interface PendingDelete {
  task: Task;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  isInitialized: boolean;
  searchQuery: string;
  pendingDelete: PendingDelete | null;

  initialize: () => Promise<void>;
  setSearchQuery: (query: string) => void;

  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task | null>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTaskWithUndo: (id: string) => Promise<void>;
  deleteTasks: (ids: string[]) => Promise<void>;
  undoDelete: () => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

async function syncTriggers(): Promise<void> {
  await Promise.all([syncGeofences(), syncNotifications()]);
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  isInitialized: false,
  searchQuery: "",
  pendingDelete: null,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const tasks = await taskDb.getAllTasks();
      set({ tasks, isInitialized: true });
      await syncTriggers();
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

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

  deleteTasks: async (ids) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);

    const existing = get().pendingDelete;
    if (existing) {
      clearTimeout(existing.timeoutId);
      idSet.add(existing.task.id);
      set({ pendingDelete: null });
    }

    set({ tasks: get().tasks.filter((t) => !idSet.has(t.id)) });
    await Promise.all([...idSet].map((id) => taskDb.deleteTask(id)));
    await syncTriggers();
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
