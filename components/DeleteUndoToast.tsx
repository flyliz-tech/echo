import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, shadow, spacing, typography } from "@/constants/theme";

interface DeleteUndoToastProps {
  taskTitle: string;
  onUndo: () => void;
}

export function DeleteUndoToast({ taskTitle, onUndo }: DeleteUndoToastProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.text, shadowColor: colors.shadow },
      ]}
    >
      <Text style={[styles.message, { color: colors.surface }]} numberOfLines={1}>
        Deleted &quot;{taskTitle}&quot;
      </Text>
      <Pressable onPress={onUndo} style={styles.undoButton}>
        <Text style={[styles.undoText, { color: colors.primary }]}>Undo</Text>
        <Ionicons name="arrow-undo" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadow.md,
  },
  message: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  undoText: {
    ...typography.label,
    fontWeight: "600",
  },
});
