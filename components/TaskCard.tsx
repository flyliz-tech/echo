import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { Task, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: task.isCompleted ? 0.6 : 1,
        },
      ]}
    >
      <Pressable
        onPress={onToggleComplete}
        hitSlop={12}
        style={styles.checkbox}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.isCompleted }}
      >
        <Ionicons
          name={task.isCompleted ? "checkbox" : "square-outline"}
          size={24}
          color={task.isCompleted ? colors.success : colors.textSecondary}
        />
      </Pressable>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.content,
          pressed && !task.isCompleted && styles.contentPressed,
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text },
            task.isCompleted && styles.completedTitle,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {hasTimeTrigger(task) && task.triggerTime && (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {formatTriggerTime(task.triggerTime)}
            </Text>
          </View>
        )}

        {hasLocationTrigger(task) && task.locationName && (
          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.detail, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {task.locationName}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  checkbox: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  contentPressed: {
    opacity: 0.9,
  },
  title: {
    ...typography.heading,
    fontSize: 16,
  },
  completedTitle: {
    textDecorationLine: "line-through",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detail: {
    ...typography.caption,
    flex: 1,
  },
});
