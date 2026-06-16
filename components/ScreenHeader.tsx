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
      <View style={styles.side}>{left}</View>
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const SIDE_WIDTH = 72;

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    width: SIDE_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  right: {
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  title: {
    flex: 1,
    textAlign: "center",
    ...typography.title,
    fontSize: 20,
  },
});
