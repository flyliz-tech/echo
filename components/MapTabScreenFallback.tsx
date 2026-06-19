import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { TaskCard } from "@/components/TaskCard";
import { useTheme } from "@/hooks/useTheme";
import { openTask } from "@/lib/navigation/taskRouting";
import { spacing, typography } from "@/constants/theme";
import { hasLocationTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export default function MapTabScreenFallback() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const locationTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.isCompleted &&
          hasLocationTrigger(t) &&
          t.latitude != null &&
          t.longitude != null
      ),
    [tasks]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Full map requires a development build. Location tasks:
      </Text>
      <FlatList
        data={locationTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No location tasks to show on the map
          </Text>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => openTask(router, item.id)}
            onToggleComplete={() => toggleComplete(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
    paddingTop: spacing.xl,
  },
});
