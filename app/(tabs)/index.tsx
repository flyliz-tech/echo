import { Ionicons } from "@expo/vector-icons";
import { format, isSameDay, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateSlider } from "@/components/DateSlider";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchBar } from "@/components/SearchBar";
import { TaskCard } from "@/components/TaskCard";
import { TaskSortToggle } from "@/components/TaskSortToggle";
import { useTheme } from "@/hooks/useTheme";
import { useVisibleTasks } from "@/hooks/useVisibleTasks";
import { radius, spacing, typography } from "@/constants/theme";
import { SortMode, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { useSortStore } from "@/lib/store/sortStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { filterTasks, sortTasks } from "@/lib/utils/taskSort";
import {
  EmptyStateVariant,
  resolveTaskEmptyState,
} from "@/lib/utils/taskEmptyState";

type IoniconName = keyof typeof Ionicons.glyphMap;

const EMPTY_ICONS: Record<Exclude<EmptyStateVariant, "global">, IoniconName> = {
  search: "search-outline",
  day: "calendar-outline",
  category: "funnel-outline",
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const sortMode = useSortStore((s) => s.sortMode);
  const setSortMode = useSortStore((s) => s.setSortMode);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const tasks = useVisibleTasks();
  const allTasks = useTaskStore((s) => s.tasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const deleteTasks = useTaskStore((s) => s.deleteTasks);
  const isSearching = searchFocused || searchQuery.length > 0;
  const isTimeTab = sortMode === "triggerTime";
  const isLocationTab = sortMode === "location";
  const isCompletedTab = sortMode === "showCompleted";
  // Both these tabs swap the search bar for the day slider. Time tasks are keyed
  // by their trigger time; completed tasks by the day they were completed.
  const usesDaySlider = isTimeTab || isCompletedTab;

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Days that have a task for the active slider, surfaced as dots.
  const markedDays = useMemo(() => {
    const set = new Set<string>();
    if (!usesDaySlider) return set;
    for (const t of allTasks) {
      const iso = isCompletedTab
        ? t.isCompleted
          ? t.completedAt
          : null
        : hasTimeTrigger(t)
        ? t.triggerTime
        : null;
      if (iso) set.add(format(parseISO(iso), "yyyy-MM-dd"));
    }
    return set;
  }, [allTasks, usesDaySlider, isCompletedTab]);

  const displayedTasks = useMemo(() => {
    if (isTimeTab) {
      // Day schedule: every time-triggered task for the day, completed included.
      // Incomplete first (ascending by time), completed pushed to the bottom.
      return allTasks
        .filter(
          (t) =>
            hasTimeTrigger(t) &&
            t.triggerTime &&
            isSameDay(parseISO(t.triggerTime), selectedDate)
        )
        .sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          return a.triggerTime!.localeCompare(b.triggerTime!);
        });
    }
    if (isLocationTab) {
      // All location tasks (completed included). `default` sort already keeps
      // incomplete first then completed, so completed land at the bottom.
      const located = allTasks.filter((t) => hasLocationTrigger(t));
      return filterTasks(sortTasks(located, "default"), searchQuery);
    }
    if (isCompletedTab) {
      return tasks.filter(
        (t) => t.completedAt && isSameDay(parseISO(t.completedAt), selectedDate)
      );
    }
    return tasks;
  }, [
    tasks,
    allTasks,
    isTimeTab,
    isLocationTab,
    isCompletedTab,
    selectedDate,
    searchQuery,
  ]);

  // Category-aware empty state: only the truly-zero-tasks case shows the global
  // Echo logo; otherwise a message specific to the active category/day/search.
  const emptyState = resolveTaskEmptyState({
    totalTaskCount: allTasks.length,
    sortMode,
    searchQuery,
    dayFiltered: usesDaySlider,
    dateLabel: format(selectedDate, "EEEE, MMM d"),
  });

  const handleSortChange = (mode: SortMode) => {
    // The slider tabs swap search for the day slider, so drop any query.
    if (mode === "triggerTime" || mode === "showCompleted") {
      setSearchQuery("");
      setSearchFocused(false);
    }
    setSortMode(mode);
  };

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enterSelection = (id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allSelected =
    displayedTasks.length > 0 && selectedIds.size === displayedTasks.length;

  const toggleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(displayedTasks.map((t) => t.id))
    );
  };

  const confirmDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    Alert.alert(
      "Delete tasks",
      `Delete ${count} selected task${count > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTasks([...selectedIds]);
            exitSelection();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {selectionMode ? (
        <ScreenHeader
          title={`${selectedIds.size} selected`}
          left={
            <Pressable
              onPress={exitSelection}
              hitSlop={8}
              accessibilityLabel="Cancel selection"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          }
          right={
            <>
              <Pressable
                onPress={toggleSelectAll}
                hitSlop={8}
                accessibilityLabel="Select all"
              >
                <Ionicons
                  name={allSelected ? "checkbox" : "square-outline"}
                  size={24}
                  color={colors.primary}
                />
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                hitSlop={8}
                accessibilityLabel="Delete selected"
              >
                <Ionicons name="trash-outline" size={24} color={colors.danger} />
              </Pressable>
            </>
          }
        />
      ) : (
        <ScreenHeader
          title="Echo"
          right={
            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={8}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </Pressable>
          }
        />
      )}

      {!selectionMode && (
        <TaskSortToggle value={sortMode} onChange={handleSortChange} />
      )}

      {!selectionMode &&
        (usesDaySlider ? (
          <DateSlider
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            markedDays={markedDays}
          />
        ) : (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            active={isSearching}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        ))}

      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            {emptyState.variant === "global" ? (
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.emptyLogo}
              />
            ) : (
              <Ionicons
                name={EMPTY_ICONS[emptyState.variant]}
                size={48}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
            )}
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {emptyState.title}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {emptyState.subtitle}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            selectionMode={selectionMode}
            selected={selectedIds.has(item.id)}
            onPress={() =>
              selectionMode
                ? toggleSelect(item.id)
                : router.push(`/task/${item.id}`)
            }
            onLongPress={() => {
              if (!selectionMode) enterSelection(item.id);
            }}
            onToggleComplete={() => toggleComplete(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingBottom: spacing.sm,
  },
  empty: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  emptyLogo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
  },
});
