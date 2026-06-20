import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { DEFAULT_CENTER } from "@/constants/map";
import { GeocodeResult } from "@/lib/services/geocoding";
import {
  DEFAULT_RADIUS_METERS,
  MAX_RADIUS_METERS,
  MIN_RADIUS_METERS,
} from "@/lib/types/task";

export interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  locationName: string;
  onLocationChange: (latitude: number, longitude: number) => void;
  onLocationNameChange: (name: string) => void;
  onRadiusChange: (radius: number) => void;
}

export function LocationPickerFallback({
  latitude,
  longitude,
  radiusMeters,
  locationName,
  onLocationChange,
  onLocationNameChange,
  onRadiusChange,
  message = "Map picker requires a development build with Mapbox SDK",
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

  const handleSelectPlace = useCallback(
    (place: GeocodeResult) => {
      onLocationChange(place.latitude, place.longitude);
      onLocationNameChange(place.name);
    },
    [onLocationChange, onLocationNameChange]
  );

  return (
    <View style={styles.container}>
      <PlaceSearchInput
        value={locationName}
        onChangeText={onLocationNameChange}
        onSelectPlace={handleSelectPlace}
        placeholder="Search for a place"
      />
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
    gap: spacing.sm,
  },
  mapPlaceholder: {
    height: 220,
    borderWidth: 1,
    borderRadius: radius.md,
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
    borderRadius: radius.md,
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
