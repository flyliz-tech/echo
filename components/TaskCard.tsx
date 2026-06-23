import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { EchoCheckbox } from "@/components/ui/EchoCheckbox";
import { TriggerChip } from "@/components/ui/TriggerChip";
import { EchoCard } from "@/components/ui/EchoCard";
import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = [
    styles.card,
    selected && {
      backgroundColor: colors.primaryMuted,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    task.isCompleted && !selected ? styles.completed : undefined,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <EchoCard style={cardStyle} elevated={!task.isCompleted}>
        <View style={styles.row}>
        <EchoCheckbox
          checked={task.isCompleted}
          selected={selected}
          selectionMode={selectionMode}
          onPress={selectionMode ? onPress : onToggleComplete}
          onLongPress={onLongPress}
        />

        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={300}
          onPressIn={() => {
            scale.value = withSpring(0.98, { damping: 15 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 15 });
          }}
          style={styles.content}
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

          <View style={styles.chips}>
            {hasTimeTrigger(task) && task.triggerTime && (
              <TriggerChip
                type="time"
                label={formatTriggerTime(task.triggerTime)}
              />
            )}
            {hasLocationTrigger(task) && task.locationName && (
              <TriggerChip type="location" label={task.locationName} />
            )}
          </View>
        </Pressable>
        </View>
      </EchoCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 16,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  completed: {
    opacity: 0.6,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
