import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing } from "@/constants/theme";

export function TaskListSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.row,
            { backgroundColor: colors.surfaceContainer },
          ]}
        >
          <View
            style={[styles.circle, { backgroundColor: colors.surfaceContainerHigh }]}
          />
          <View style={styles.lines}>
            <View
              style={[styles.line, styles.lineLong, { backgroundColor: colors.surfaceContainerHigh }]}
            />
            <View
              style={[styles.line, styles.lineShort, { backgroundColor: colors.surfaceContainerHigh }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  lines: {
    flex: 1,
    gap: spacing.sm,
  },
  line: {
    height: 12,
    borderRadius: 6,
  },
  lineLong: {
    width: "80%",
  },
  lineShort: {
    width: "45%",
  },
});
