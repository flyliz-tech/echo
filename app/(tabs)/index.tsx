import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { SearchBar } from "@/components/SearchBar";
import { TaskCard } from "@/components/TaskCard";
import { TaskSortToggle } from "@/components/TaskSortToggle";
import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";
import { selectFilteredTasks, useTaskStore } from "@/lib/store/taskStore";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const sortMode = useTaskStore((s) => s.sortMode);
  const setSortMode = useTaskStore((s) => s.setSortMode);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const tasks = useTaskStore(useShallow(selectFilteredTasks));
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const deleteTasks = useTaskStore((s) => s.deleteTasks);
  const isSearching = searchFocused || searchQuery.length > 0;

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={isDark ? ["top", "bottom"] : ["bottom"]}
    >
      {selectionMode ? (
        <View style={styles.topBar}>
          <Pressable
            onPress={exitSelection}
            hitSlop={8}
            accessibilityLabel="Cancel selection"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            {selectedIds.size} selected
          </Text>
          <View style={styles.selectionActions}>
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
          </View>
        </View>
      ) : (
        <View style={styles.topBar}>
          <Text style={[styles.title, { color: colors.text }]}>
            {searchFocused ? "Search" : "Echo"}
          </Text>
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={8}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      )}

      {!selectionMode && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          active={isSearching}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      )}

      {!selectionMode && !isSearching && (
        <TaskSortToggle value={sortMode} onChange={setSortMode} />
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? "No matching tasks" : "No tasks yet. Tap + to create one."}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  title: {
    ...typography.title,
    fontSize: 20,
  },
  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  sortLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  empty: {
    paddingTop: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
  },
});
