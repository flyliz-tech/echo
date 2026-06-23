import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { elevationStyles, radius, spacing, typography } from "@/constants/theme";

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
        { backgroundColor: colors.toastSurface },
        elevationStyles.level2,
      ]}
    >
      <Text style={[styles.message, { color: colors.onToast }]} numberOfLines={1}>
        Task deleted
      </Text>
      <Pressable onPress={onUndo} style={styles.undoButton}>
        <Text style={[styles.undoText, { color: colors.undo }]}>UNDO</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  message: {
    ...typography.bodyMd,
    flex: 1,
  },
  undoButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  undoText: {
    ...typography.labelSm,
    letterSpacing: 1,
  },
});
