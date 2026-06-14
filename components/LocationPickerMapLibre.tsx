import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
} from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { MapPin } from "@/components/MapPin";
import {
  LocationPickerFallback,
  type LocationPickerProps,
} from "@/components/LocationPickerFallback";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import {
  DEFAULT_CENTER,
  latitudeDeltaToZoom,
  MAP_STYLE_URL,
} from "@/constants/map";
import {
  DEFAULT_RADIUS_METERS,
  MAX_RADIUS_METERS,
  MIN_RADIUS_METERS,
} from "@/lib/types/task";
import { getCurrentLocation } from "@/lib/services/geofencing";
import { circleFeatureCollection } from "@/lib/utils/mapGeoJson";

const PICKER_ZOOM = latitudeDeltaToZoom(0.02);

export function LocationPickerMapLibre(props: LocationPickerProps) {
  const {
    latitude,
    longitude,
    radiusMeters,
    onLocationChange,
    onRadiusChange,
  } = props;
  const { colors } = useTheme();
  const cameraRef = useRef<CameraRef>(null);
  const [hasInitializedLocation, setHasInitializedLocation] = useState(
    latitude != null && longitude != null
  );

  const pinLat = latitude ?? DEFAULT_CENTER.latitude;
  const pinLng = longitude ?? DEFAULT_CENTER.longitude;

  const radiusGeoJson = useMemo(
    () => circleFeatureCollection(pinLng, pinLat, radiusMeters),
    [pinLng, pinLat, radiusMeters]
  );

  useEffect(() => {
    if (hasInitializedLocation) return;

    getCurrentLocation().then((loc) => {
      if (loc) {
        cameraRef.current?.jumpTo({
          center: [loc.longitude, loc.latitude],
          zoom: PICKER_ZOOM,
        });
        onLocationChange(loc.latitude, loc.longitude);
      } else {
        onLocationChange(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);
      }
      setHasInitializedLocation(true);
    });
  }, [hasInitializedLocation, onLocationChange]);

  useEffect(() => {
    if (!hasInitializedLocation || latitude == null || longitude == null) return;
    cameraRef.current?.jumpTo({
      center: [longitude, latitude],
      zoom: PICKER_ZOOM,
    });
  }, [hasInitializedLocation, latitude, longitude]);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <Map
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          onPress={(event) => {
            const [lng, lat] = event.nativeEvent.lngLat;
            cameraRef.current?.jumpTo({ center: [lng, lat], zoom: PICKER_ZOOM });
            onLocationChange(lat, lng);
          }}
          onRegionDidChange={(event) => {
            if (!event.nativeEvent.userInteraction) return;
            const [lng, lat] = event.nativeEvent.center;
            onLocationChange(lat, lng);
          }}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [pinLng, pinLat],
              zoom: PICKER_ZOOM,
            }}
          />
          <GeoJSONSource id="picker-radius" data={radiusGeoJson}>
            <Layer
              type="fill"
              paint={{
                "fill-color": "#2563EB",
                "fill-opacity": 0.15,
              }}
            />
            <Layer
              type="line"
              paint={{
                "line-color": "#2563EB",
                "line-opacity": 0.5,
                "line-width": 2,
              }}
            />
          </GeoJSONSource>
        </Map>
        <View pointerEvents="none" style={styles.centerPin}>
          <MapPin size={28} />
        </View>
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
  mapWrapper: {
    position: "relative",
  },
  map: {
    height: 220,
    width: "100%",
  },
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -14,
    marginTop: -36,
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
