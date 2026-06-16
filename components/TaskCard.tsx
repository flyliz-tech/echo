import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, shadow, spacing, typography } from "@/constants/theme";
import { Task, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
}

export function TaskCard({
  task,
  onPress,
  onToggleComplete,
  onLongPress,
  selectionMode = false,
  selected = false,
}: TaskCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        !task.isCompleted && shadow.sm,
        {
          backgroundColor: selected ? colors.primaryMuted : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 1.5 : 1,
          shadowColor: colors.shadow,
          opacity: task.isCompleted && !selected ? 0.6 : 1,
        },
      ]}
    >
      <Pressable
        onPress={selectionMode ? onPress : onToggleComplete}
        onLongPress={onLongPress}
        delayLongPress={300}
        hitSlop={12}
        style={styles.checkbox}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: selectionMode ? selected : task.isCompleted,
        }}
      >
        <Ionicons
          name={
            selectionMode
              ? selected
                ? "checkmark-circle"
                : "ellipse-outline"
              : task.isCompleted
                ? "checkbox"
                : "square-outline"
          }
          size={24}
          color={
            selectionMode
              ? selected
                ? colors.primary
                : colors.textSecondary
              : task.isCompleted
                ? colors.success
                : colors.textSecondary
          }
        />
      </Pressable>

      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
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
