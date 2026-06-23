import {
  addDays,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";

interface DateSliderProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysWithTasks?: Set<string>;
}

export function DateSlider({
  selectedDate,
  onSelectDate,
  daysWithTasks,
}: DateSliderProps) {
  const { colors } = useTheme();

  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const range: Date[] = [];
    for (let i = -7; i <= 14; i++) {
      range.push(addDays(today, i));
    }
    return range;
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const selected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const hasTasks = daysWithTasks?.has(key);

        return (
          <Pressable
            key={key}
            onPress={() => onSelectDate(day)}
            style={[
              styles.day,
              selected && { backgroundColor: colors.primary },
              !selected && isToday && {
                borderWidth: 1.5,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.weekday,
                {
                  color: selected
                    ? colors.onPrimary
                    : colors.textSecondary,
                },
              ]}
            >
              {format(day, "EEE")}
            </Text>
            <Text
              style={[
                styles.dayNum,
                {
                  color: selected ? colors.onPrimary : colors.text,
                },
              ]}
            >
              {format(day, "d")}
            </Text>
            {hasTasks && (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: selected
                      ? colors.onPrimary
                      : colors.primary,
                  },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
  },
  day: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 64,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
  weekday: {
    ...typography.labelSm,
    fontSize: 11,
    letterSpacing: 0,
  },
  dayNum: {
    ...typography.heading,
    fontSize: 16,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
