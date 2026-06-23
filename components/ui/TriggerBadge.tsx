import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius } from "@/constants/theme";
import type { TriggerType } from "@/lib/types/task";

interface TriggerBadgeProps {
  triggerType: TriggerType;
  size?: number;
}

export function TriggerBadge({ triggerType, size = 20 }: TriggerBadgeProps) {
  const { colors } = useTheme();

  if (triggerType === "none") return null;

  if (triggerType === "both") {
    return (
      <View style={[styles.badge, { width: size, height: size }]}>
        <View
          style={[
            styles.half,
            styles.leftHalf,
            { backgroundColor: colors.timeMuted },
          ]}
        >
          <Ionicons name="time" size={size * 0.45} color={colors.timeContainer} />
        </View>
        <View
          style={[
            styles.half,
            styles.rightHalf,
            { backgroundColor: colors.locationMuted },
          ]}
        >
          <Ionicons
            name="location"
            size={size * 0.45}
            color={colors.locationContainer}
          />
        </View>
      </View>
    );
  }

  const isTime = triggerType === "time";
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          backgroundColor: isTime ? colors.timeMuted : colors.locationMuted,
        },
      ]}
    >
      <Ionicons
        name={isTime ? "time" : "location"}
        size={size * 0.5}
        color={isTime ? colors.timeContainer : colors.locationContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexDirection: "row",
  },
  half: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  leftHalf: {
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
  },
  rightHalf: {
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
});
