import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { layout, typography } from "@/constants/theme";

interface GhostButtonProps {
  label: string;
  onPress: () => void;
}

export function GhostButton({ label, onPress }: GhostButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  label: {
    ...typography.label,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
