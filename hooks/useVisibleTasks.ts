import { useMemo } from "react";

import { useSortStore } from "@/lib/store/sortStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { selectVisibleTasks } from "@/lib/utils/taskSort";

/**
 * The task list as it should be displayed: sorted by the persisted sort
 * preference and filtered by the active search query. Shared by every screen
 * that lists tasks so the sort trigger stays consistent everywhere.
 */
export function useVisibleTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const sortMode = useSortStore((s) => s.sortMode);

  return useMemo(
    () => selectVisibleTasks(tasks, sortMode, searchQuery),
    [tasks, sortMode, searchQuery]
  );
}
