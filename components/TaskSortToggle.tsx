import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { SortMode } from "@/lib/types/task";

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "default", label: "All" },
  { mode: "triggerTime", label: "Date & Time" },
  { mode: "location", label: "Location" },
  { mode: "showCompleted", label: "Completed" },
];

interface TaskSortToggleProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

export function TaskSortToggle({ value, onChange }: TaskSortToggleProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {SORT_OPTIONS.map((option) => {
        const active = value === option.mode;
        return (
          <Pressable
            key={option.mode}
            onPress={() => onChange(option.mode)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primaryMuted : colors.surface,
                borderColor: active ? colors.primary : colors.border,
                borderWidth: active ? 1.5 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  label: {
    ...typography.label,
    fontSize: 13,
  },
});
