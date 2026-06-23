import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing } from "@/constants/theme";

export function MapSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View
        style={[styles.pin, { backgroundColor: colors.surfaceContainerHigh }]}
      />
      <View style={styles.controls}>
        <View
          style={[styles.control, { backgroundColor: colors.surfaceContainerHigh }]}
        />
        <View
          style={[styles.control, { backgroundColor: colors.surfaceContainerHigh }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  controls: {
    position: "absolute",
    bottom: spacing.xl * 3,
    right: spacing.md,
    gap: spacing.sm,
  },
  control: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
});
