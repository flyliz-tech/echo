import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { radius, shadow, spacing, typography } from "@/constants/theme";

export interface Feedback {
  message: string;
  type: "success" | "error";
  /** Bumped on every trigger so repeated messages re-animate. */
  nonce: number;
}

interface FeedbackToastProps {
  feedback: Feedback | null;
  onHidden: () => void;
}

// How long the toast stays fully visible before fading out.
const HOLD_MS = 1600;

/**
 * Transient success/failure toast. Fades in, holds, then fades out entirely on
 * the Reanimated clock — no setTimeout/interval — and clears itself via
 * `onHidden` once the exit animation completes.
 */
export function FeedbackToast({ feedback, onHidden }: FeedbackToastProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (!feedback) return;
    translateY.value = 12;
    translateY.value = withTiming(0, { duration: 200 });
    opacity.value = withSequence(
      withTiming(1, { duration: 180 }),
      withDelay(
        HOLD_MS,
        withTiming(0, { duration: 260 }, (finished) => {
          if (finished) runOnJS(onHidden)();
        })
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback?.nonce]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!feedback) return null;

  const isError = feedback.type === "error";
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: colors.text, shadowColor: colors.shadow },
      ]}
    >
      <Ionicons
        name={isError ? "alert-circle" : "checkmark-circle"}
        size={18}
        color={isError ? colors.danger : colors.success}
      />
      <Text style={[styles.message, { color: colors.surface }]} numberOfLines={2}>
        {feedback.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadow.md,
  },
  message: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
  },
});
