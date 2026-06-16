import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";

export const HEADER_HEIGHT = 56;

interface ScreenHeaderProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function ScreenHeader({ title, left, right }: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      {left ? <View style={styles.left}>{left}</View> : null}
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginRight: spacing.md,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginLeft: spacing.md,
  },
  title: {
    flex: 1,
    textAlign: "left",
    ...typography.title,
    fontSize: 20,
  },
});
