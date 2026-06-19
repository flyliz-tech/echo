import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SortMode } from "@/lib/types/task";

interface SortStore {
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
}

/**
 * Holds the task list sort preference. Persisted to AsyncStorage so the chosen
 * sort (e.g. by time trigger) survives app refresh, and shared across every
 * entry point that lists tasks.
 */
export const useSortStore = create<SortStore>()(
  persist(
    (set) => ({
      sortMode: "default",
      setSortMode: (sortMode) => set({ sortMode }),
    }),
    {
      name: "echo-task-sort",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
