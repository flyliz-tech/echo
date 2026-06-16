import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
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
  const isSearching = searchFocused || searchQuery.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={isDark ? ["top", "bottom"] : ["bottom"]}
    >
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

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        active={isSearching}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
      />

      {!isSearching && (
        <>
          {/* <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>
            Sort task by:
          </Text> */}
          <TaskSortToggle value={sortMode} onChange={setSortMode} />
        </>
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
            onPress={() => router.push(`/task/${item.id}`)}
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
