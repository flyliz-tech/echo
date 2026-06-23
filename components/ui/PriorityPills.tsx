import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import {
  DEFAULT_PRIORITY,
  PRIORITY_META,
  Priority,
} from "@/lib/types/task";

interface PriorityPillsProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export function PriorityPills({ value, onChange }: PriorityPillsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        PRIORITY
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {PRIORITIES.map((p) => {
          const meta = PRIORITY_META[p];
          const active = value === p;
          return (
            <Pressable
              key={p}
              onPress={() => onChange(p)}
              style={[
                styles.pill,
                {
                  borderColor: active ? meta.dotColor : colors.outlineVariant,
                  backgroundColor: active
                    ? `${meta.dotColor}18`
                    : colors.surface,
                },
              ]}
            >
              <View
                style={[styles.dot, { backgroundColor: meta.dotColor }]}
              />
              <Text style={[styles.pillText, { color: colors.text }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export { DEFAULT_PRIORITY };

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelSm,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    ...typography.label,
  },
});
