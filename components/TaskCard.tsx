import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { Task } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: task.isCompleted ? 0.6 : pressed ? 0.9 : 1,
        },
      ]}
    >
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          onToggleComplete();
        }}
        hitSlop={8}
        style={styles.checkbox}
      >
        <Ionicons
          name={task.isCompleted ? "checkbox" : "square-outline"}
          size={24}
          color={task.isCompleted ? colors.success : colors.textSecondary}
        />
      </Pressable>

      <View style={styles.content}>
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

        {task.triggerType === "time" && task.triggerTime && (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {formatTriggerTime(task.triggerTime)}
            </Text>
          </View>
        )}

        {task.triggerType === "location" && task.locationName && (
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
      </View>
    </Pressable>
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
