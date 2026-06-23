import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";

export const HEADER_HEIGHT = 56;

interface EchoScreenHeaderProps {
  title?: string;
  wordmark?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}

export function EchoScreenHeader({
  title,
  wordmark = false,
  left,
  right,
}: EchoScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      {left ? <View style={styles.side}>{left}</View> : <View style={styles.side} />}
      {wordmark ? (
        <Text style={[styles.wordmark, { color: colors.primary }]}>Echo</Text>
      ) : (
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      {right ? <View style={styles.side}>{right}</View> : <View style={styles.side} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  side: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  wordmark: {
    ...typography.headlineLg,
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  title: {
    ...typography.title,
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
});
