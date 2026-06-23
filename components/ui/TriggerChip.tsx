import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, typography } from "@/constants/theme";

interface TriggerChipProps {
  type: "time" | "location";
  label: string;
}

export function TriggerChip({ type, label }: TriggerChipProps) {
  const { colors } = useTheme();
  const isTime = type === "time";

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isTime ? colors.timeMuted : colors.locationMuted,
        },
      ]}
    >
      <Ionicons
        name={isTime ? "time-outline" : "location-outline"}
        size={14}
        color={isTime ? colors.timeContainer : colors.locationContainer}
      />
      <Text
        style={[
          styles.label,
          { color: isTime ? colors.timeContainer : colors.locationContainer },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    maxWidth: "100%",
  },
  label: {
    ...typography.labelSm,
    fontSize: 12,
    letterSpacing: 0,
    flexShrink: 1,
  },
});
