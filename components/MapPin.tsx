import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

import { TriggerBadge } from "@/components/ui/TriggerBadge";
import { useTheme } from "@/hooks/useTheme";
import type { TriggerType } from "@/lib/types/task";

interface MapPinProps {
  size?: number;
  triggerType?: TriggerType;
}

export function MapPin({ size = 32, triggerType = "location" }: MapPinProps) {
  const { colors } = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.4, { duration: 1200 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size + 8 }]}>
      <Animated.View
        style={[
          styles.pulse,
          pulseStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primaryMuted,
          },
        ]}
      />
      <View style={styles.badgeWrap}>
        <TriggerBadge triggerType={triggerType} size={size * 0.75} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pulse: {
    position: "absolute",
    bottom: 4,
  },
  badgeWrap: {
    marginBottom: 2,
  },
});
