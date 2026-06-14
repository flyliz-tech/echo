import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import {
  DEFAULT_RADIUS_METERS,
  MAX_RADIUS_METERS,
  MIN_RADIUS_METERS,
} from "@/lib/types/task";
import { getCurrentLocation } from "@/lib/services/geofencing";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  onRadiusChange: (radius: number) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 13.0654,
  longitude: 74.9982,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function LocationPicker({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
  onRadiusChange,
}: LocationPickerProps) {
  const { colors } = useTheme();
  const [region, setRegion] = useState<Region>(() =>
    latitude != null && longitude != null
      ? { ...DEFAULT_REGION, latitude, longitude }
      : DEFAULT_REGION
  );

  const [hasInitializedLocation, setHasInitializedLocation] = useState(
    latitude != null && longitude != null
  );

  useEffect(() => {
    if (hasInitializedLocation) return;

    getCurrentLocation().then((loc) => {
      if (loc) {
        setRegion((prev) => ({ ...prev, ...loc }));
        onLocationChange(loc.latitude, loc.longitude);
      } else {
        onLocationChange(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude);
      }
      setHasInitializedLocation(true);
    });
  }, [hasInitializedLocation, onLocationChange]);

  const pinLat = latitude ?? region.latitude;
  const pinLng = longitude ?? region.longitude;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={(e) => {
          const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
          onLocationChange(lat, lng);
        }}
      >
        <Marker
          coordinate={{ latitude: pinLat, longitude: pinLng }}
          draggable
          onDragEnd={(e) => {
            const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
            onLocationChange(lat, lng);
          }}
        />
        <Circle
          center={{ latitude: pinLat, longitude: pinLng }}
          radius={radiusMeters}
          fillColor="rgba(37, 99, 235, 0.15)"
          strokeColor="rgba(37, 99, 235, 0.5)"
        />
      </MapView>

      <View style={[styles.radiusControl, { backgroundColor: colors.surface }]}>
        <Text style={[styles.radiusLabel, { color: colors.textSecondary }]}>
          Trigger radius: {radiusMeters}m
        </Text>
        <View style={styles.radiusButtons}>
          <Text
            style={[styles.radiusButton, { color: colors.primary }]}
            onPress={() =>
              onRadiusChange(
                Math.max(MIN_RADIUS_METERS, radiusMeters - 25)
              )
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
              onRadiusChange(
                Math.min(MAX_RADIUS_METERS, radiusMeters + 25)
              )
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
  map: {
    height: Platform.OS === "web" ? 240 : 220,
    width: "100%",
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
