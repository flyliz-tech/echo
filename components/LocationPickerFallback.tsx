import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { DEFAULT_CENTER } from "@/constants/map";
import {
  DEFAULT_RADIUS_METERS,
  MAX_RADIUS_METERS,
  MIN_RADIUS_METERS,
} from "@/lib/types/task";

export interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  onRadiusChange: (radius: number) => void;
}

export function LocationPickerFallback({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
  onRadiusChange,
  message = "Map picker requires a development build with MapLibre",
}: LocationPickerProps & { message?: string }) {
  const { colors } = useTheme();
  const [hasInitializedLocation, setHasInitializedLocation] = useState(
    latitude != null && longitude != null
  );

  const pinLat = latitude ?? DEFAULT_CENTER.latitude;
  const pinLng = longitude ?? DEFAULT_CENTER.longitude;

  useEffect(() => {
    if (hasInitializedLocation) return;
    onLocationChange(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);
    setHasInitializedLocation(true);
  }, [hasInitializedLocation, onLocationChange]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mapPlaceholder,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          {message}
        </Text>
        <Text style={[styles.coords, { color: colors.text }]}>
          {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
        </Text>
      </View>

      <View style={[styles.radiusControl, { backgroundColor: colors.surface }]}>
        <Text style={[styles.radiusLabel, { color: colors.textSecondary }]}>
          Trigger radius: {radiusMeters}m
        </Text>
        <View style={styles.radiusButtons}>
          <Text
            style={[styles.radiusButton, { color: colors.primary }]}
            onPress={() =>
              onRadiusChange(Math.max(MIN_RADIUS_METERS, radiusMeters - 25))
            }
          >
            −
          </Text>
          <Text style={[styles.radiusValue, { color: colors.text }]}>
            {radiusMeters} m
          </Text>
          <Text
            style={[styles.radiusButton, { color: colors.primary }]}
            onPress={() =>
              onRadiusChange(Math.min(MAX_RADIUS_METERS, radiusMeters + 25))
            }
          >
            +
          </Text>
        </View>
        {radiusMeters === DEFAULT_RADIUS_METERS && (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Default {DEFAULT_RADIUS_METERS} meters
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  mapPlaceholder: {
    height: 220,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  placeholderText: {
    ...typography.caption,
    textAlign: "center",
  },
  coords: {
    ...typography.label,
  },
  radiusControl: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  radiusLabel: {
    ...typography.caption,
  },
  radiusButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  radiusButton: {
    fontSize: 28,
    fontWeight: "300",
    paddingHorizontal: spacing.md,
  },
  radiusValue: {
    ...typography.heading,
    minWidth: 80,
    textAlign: "center",
  },
  hint: {
    ...typography.caption,
    textAlign: "center",
  },
});
