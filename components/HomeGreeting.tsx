import { format } from "date-fns";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";

interface HomeGreetingProps {
  userName?: string;
}

export function HomeGreeting({ userName = "User" }: HomeGreetingProps) {
  const { colors } = useTheme();
  const now = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Hello, {userName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your tasks are synced with your context.
        </Text>
      </View>
      <View
        style={[styles.datePill, { backgroundColor: colors.surfaceContainer }]}
      >
        <Text style={[styles.dateText, { color: colors.primary }]}>
          {format(now, "MMM dd").toUpperCase()} / {format(now, "EEEE")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  greeting: {
    ...typography.headlineLg,
    fontSize: 24,
  },
  subtitle: {
    ...typography.bodyMd,
    marginTop: spacing.xs,
  },
  datePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  dateText: {
    ...typography.labelSm,
    letterSpacing: 0,
    fontSize: 11,
  },
});
