import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MapTabScreen from "@/components/MapTabScreen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/constants/theme";

export default function MapTab() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View style={styles.headerPad}>
        <ScreenHeader title="Map" />
      </View>
      <View style={styles.map}>
        <MapTabScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPad: {
    paddingHorizontal: spacing.md,
  },
  map: {
    flex: 1,
  },
});
