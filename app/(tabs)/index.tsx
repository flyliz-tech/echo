import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TaskCard } from "@/components/TaskCard";
import { TaskSortToggle } from "@/components/TaskSortToggle";
import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";
import { useTaskStore } from "@/lib/store/taskStore";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const sortMode = useTaskStore((s) => s.sortMode);
  const setSortMode = useTaskStore((s) => s.setSortMode);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const getFilteredTasks = useTaskStore((s) => s.getFilteredTasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const tasks = getFilteredTasks();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View style={styles.headerActions}>
        <Pressable onPress={() => router.push("/(tabs)/create")}>
          <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => router.push("/(tabs)/map")}>
          <Ionicons name="map-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.push("/(tabs)/calendar")}>
          <Ionicons name="calendar-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by task, location, notes"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <TaskSortToggle value={sortMode} onChange={setSortMode} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks yet. Tap + to create one.
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
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
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
