import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GhostButton } from "@/components/ui/GhostButton";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { requestLocationPermissions } from "@/lib/services/geofencing";

const DISMISS_KEY = "echo_location_banner_dismissed";

export function LocationPermissionBanner() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      const dismissed = await AsyncStorage.getItem(DISMISS_KEY);
      if (dismissed === "true") return;

      const bg = await Location.getBackgroundPermissionsAsync();
      if (bg.status !== "granted") {
        setVisible(true);
      }
    })();
  }, []);

  const handleEnable = async () => {
    await requestLocationPermissions();
    const bg = await Location.getBackgroundPermissionsAsync();
    if (bg.status === "granted") {
      setVisible(false);
    }
  };

  const handleDismiss = async () => {
    await AsyncStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <Ionicons
        name="location"
        size={20}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: colors.text }]}>
        Enable background location so echoes fire when you arrive.
      </Text>
      <View style={styles.actions}>
        <GhostButton label="Not now" onPress={handleDismiss} />
        <Pressable onPress={handleEnable} style={styles.enableBtn}>
          <Text style={[styles.enableText, { color: colors.onPrimary }]}>
            Enable
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodyMd,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.sm,
  },
  enableBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  enableText: {
    ...typography.labelSm,
    letterSpacing: 0,
  },
});
