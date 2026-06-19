import { SortMode } from "@/lib/types/task";

export type EmptyStateVariant = "global" | "search" | "day" | "category";

export interface TaskEmptyState {
  variant: EmptyStateVariant;
  title: string;
  subtitle: string;
}

interface ResolveParams {
  /** Total number of tasks in the app, across every category. */
  totalTaskCount: number;
  sortMode: SortMode;
  searchQuery: string;
  /** True when the active tab filters by a day picked in the slider. */
  dayFiltered?: boolean;
  /** Human-readable label for the day selected in the slider. */
  dateLabel?: string;
}

/**
 * Decides which empty state to show for the task list.
 *
 * The global "no tasks yet" state (with the Echo logo) is reserved for when the
 * app truly has zero tasks. When tasks exist but the selected sort category /
 * day / search has none, a category-specific message is shown instead so the
 * user isn't misled into thinking they have no tasks at all.
 */
export function resolveTaskEmptyState({
  totalTaskCount,
  sortMode,
  searchQuery,
  dayFiltered,
  dateLabel,
}: ResolveParams): TaskEmptyState {
  if (searchQuery.trim().length > 0) {
    return {
      variant: "search",
      title: "No matching tasks",
      subtitle: "Try a different search term",
    };
  }

  if (totalTaskCount === 0) {
    return {
      variant: "global",
      title: "No tasks yet",
      subtitle: "Tap the + tab to create your first reminder",
    };
  }

  if (dayFiltered || sortMode === "triggerTime") {
    return {
      variant: "day",
      title:
        sortMode === "showCompleted"
          ? "Nothing completed on this day"
          : "Nothing on this day",
      subtitle: dateLabel ?? "Pick another day from the slider",
    };
  }

  return {
    variant: "category",
    title: "No tasks in this category",
    subtitle: categorySubtitle(sortMode),
  };
}

function categorySubtitle(sortMode: SortMode): string {
  switch (sortMode) {
    case "location":
      return "No location reminders yet — you have tasks in other categories";
    case "showCompleted":
      return "Nothing completed yet — you have tasks in other categories";
    default:
      return "You have tasks in other categories";
  }
}
