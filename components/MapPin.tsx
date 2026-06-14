import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface MapPinProps {
  size?: number;
}

export function MapPin({ size = 24 }: MapPinProps) {
  const { colors } = useTheme();
  const head = size;
  const stem = size * 0.45;

  return (
    <View style={[styles.container, { width: head, height: head + stem }]}>
      <View
        style={[
          styles.head,
          {
            width: head,
            height: head,
            borderRadius: head / 2,
            backgroundColor: colors.primary,
            borderColor: "#FFFFFF",
          },
        ]}
      />
      <View
        style={[
          styles.stem,
          {
            width: 2,
            height: stem,
            backgroundColor: colors.primary,
            marginTop: -2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  head: {
    borderWidth: 2,
  },
  stem: {},
});
