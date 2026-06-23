import { ScrollView, Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { SortMode } from "@/lib/types/task";

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "default", label: "All" },
  { mode: "triggerTime", label: "Date & Time" },
  { mode: "location", label: "Location" },
  { mode: "showCompleted", label: "Completed" },
];

interface FilterChipsProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

export function FilterChips({ value, onChange }: FilterChipsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SORT_OPTIONS.map((option) => {
        const active = value === option.mode;
        return (
          <Pressable
            key={option.mode}
            onPress={() => onChange(option.mode)}
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.primary }
                : {
                    backgroundColor: colors.surfaceContainer,
                    borderWidth: 1,
                    borderColor: colors.outlineVariant,
                  },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.onPrimary : colors.textVariant },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  label: {
    ...typography.labelSm,
    letterSpacing: 0,
  },
});
