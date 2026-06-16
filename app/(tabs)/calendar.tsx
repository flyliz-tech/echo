import { Ionicons } from "@expo/vector-icons";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { TaskCard } from "@/components/TaskCard";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { hasTimeTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const timeTasks = useMemo(
    () => tasks.filter((t) => hasTimeTrigger(t) && t.triggerTime),
    [tasks]
  );

  const daysWithTasks = useMemo(() => {
    const set = new Set<string>();
    for (const task of timeTasks) {
      if (task.triggerTime) {
        set.add(format(parseISO(task.triggerTime), "yyyy-MM-dd"));
      }
    }
    return set;
  }, [timeTasks]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const selectedDayTasks = useMemo(
    () =>
      timeTasks.filter(
        (t) =>
          t.triggerTime && isSameDay(parseISO(t.triggerTime), selectedDate)
      ),
    [timeTasks, selectedDate]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScreenHeader title="Calendar" />

      <View style={styles.monthHeader}>
        <Pressable onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text
            key={day}
            style={[styles.weekday, { color: colors.textSecondary }]}
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const selected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasTasks = daysWithTasks.has(key);

          return (
            <Pressable
              key={key}
              onPress={() => setSelectedDate(day)}
              style={[
                styles.dayCell,
                selected && { backgroundColor: colors.primaryMuted },
                isToday && !selected && { borderWidth: 1, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: inMonth ? colors.text : colors.textSecondary,
                    opacity: inMonth ? 1 : 0.4,
                  },
                  (selected || isToday) && { color: colors.primary, fontWeight: "700" },
                ]}
              >
                {format(day, "d")}
              </Text>
              {hasTasks && (
                <View
                  style={[styles.dot, { backgroundColor: colors.primary }]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {format(selectedDate, "EEEE, MMM d")}
      </Text>

      <FlatList
        data={selectedDayTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No time-triggered tasks for this day
          </Text>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/task/${item.id}`)}
            onToggleComplete={() => toggleComplete(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  monthTitle: {
    ...typography.heading,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    ...typography.caption,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  dayText: {
    ...typography.body,
    fontSize: 15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 16,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
    paddingTop: spacing.md,
  },
});
