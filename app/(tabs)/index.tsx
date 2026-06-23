import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format, isSameDay, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { DateSlider } from "@/components/DateSlider";
import { HomeGreeting } from "@/components/HomeGreeting";
import { LocationPermissionBanner } from "@/components/LocationPermissionBanner";
import { MapPreviewCard } from "@/components/MapPreviewCard";
import { SearchBar } from "@/components/SearchBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TaskCard } from "@/components/TaskCard";
import { TaskSortToggle } from "@/components/TaskSortToggle";
import { useTheme } from "@/hooks/useTheme";
import { layout, radius, spacing, typography } from "@/constants/theme";
import { selectFilteredTasks, useTaskStore } from "@/lib/store/taskStore";
import { Task, SortMode } from "@/lib/types/task";

function filterByDate(tasks: Task[], sortMode: SortMode, selectedDate: Date) {
  if (sortMode !== "triggerTime" && sortMode !== "showCompleted") {
    return tasks;
  }
  return tasks.filter((task) => {
    if (sortMode === "showCompleted") {
      return isSameDay(parseISO(task.createdAt), selectedDate);
    }
    if (task.triggerTime) {
      return isSameDay(parseISO(task.triggerTime), selectedDate);
    }
    return false;
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const sortMode = useTaskStore((s) => s.sortMode);
  const setSortMode = useTaskStore((s) => s.setSortMode);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const baseTasks = useTaskStore(useShallow(selectFilteredTasks));
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const deleteTasks = useTaskStore((s) => s.deleteTasks);
  const isSearching = searchFocused || searchQuery.length > 0;

  const tasks = useMemo(
    () => filterByDate(baseTasks, sortMode, selectedDate),
    [baseTasks, sortMode, selectedDate]
  );

  const daysWithTasks = useMemo(() => {
    const set = new Set<string>();
    for (const task of baseTasks) {
      if (sortMode === "showCompleted") {
        set.add(format(parseISO(task.createdAt), "yyyy-MM-dd"));
      } else if (task.triggerTime) {
        set.add(format(parseISO(task.triggerTime), "yyyy-MM-dd"));
      }
    }
    return set;
  }, [baseTasks, sortMode]);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(tasks.map((t) => t.id)));
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

  const showDateSlider =
    !selectionMode &&
    !isSearching &&
    (sortMode === "triggerTime" || sortMode === "showCompleted");

  const listHeader = (
    <>
      {!selectionMode && (
        <>
          <LocationPermissionBanner />
          <HomeGreeting />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            active={isSearching}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <TaskSortToggle value={sortMode} onChange={setSortMode} />
          {showDateSlider && (
            <DateSlider
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              daysWithTasks={daysWithTasks}
            />
          )}
          {!isSearching && (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.outline }]}>
                YOUR TASKS
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/search")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See All
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {selectionMode ? (
        <ScreenHeader
          title={`${selectedIds.size} selected`}
          left={
            <Pressable onPress={exitSelection} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          }
          right={
            <>
              <Pressable onPress={toggleSelectAll} hitSlop={8}>
                <Ionicons
                  name={allSelected ? "checkbox" : "square-outline"}
                  size={24}
                  color={colors.primary}
                />
              </Pressable>
              <Pressable onPress={confirmDelete} hitSlop={8}>
                <Ionicons name="trash-outline" size={24} color={colors.danger} />
              </Pressable>
            </>
          }
        />
      ) : (
        <ScreenHeader
          wordmark
          right={
            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={8}
              accessibilityLabel="Settings"
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.textVariant}
              />
            </Pressable>
          }
        />
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        ListFooterComponent={!selectionMode && !isSearching ? <MapPreviewCard /> : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            {searchQuery ? (
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
            ) : (
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.emptyLogo}
              />
            )}
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? "No matching tasks" : "No tasks yet"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery
                ? "Try a different search term"
                : "Tap the + tab to create your first reminder"}
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
    paddingBottom: layout.tabBarHeight + spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.labelSm,
    letterSpacing: 1.2,
  },
  seeAll: {
    ...typography.labelSm,
    letterSpacing: 0,
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
