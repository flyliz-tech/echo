import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
} from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPin } from "@/components/MapPin";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { type LocationPickerProps } from "@/components/LocationPickerFallback";
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
import { GeocodeResult, reverseGeocode } from "@/lib/services/geocoding";
import {
  circleOutlineCollection,
  circlePolygonCollection,
} from "@/lib/utils/mapGeoJson";

const PICKER_ZOOM = latitudeDeltaToZoom(0.02);
const REVERSE_DEBOUNCE_MS = 600;

interface MapAreaProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onPick: (latitude: number, longitude: number) => void;
  onEnlarge?: () => void;
  mapStyle: object;
}

function MapArea({
  latitude,
  longitude,
  radiusMeters,
  onPick,
  onEnlarge,
  mapStyle,
}: MapAreaProps) {
  const { colors } = useTheme();
  const cameraRef = useRef<CameraRef>(null);

  const pinLat = latitude ?? DEFAULT_CENTER.latitude;
  const pinLng = longitude ?? DEFAULT_CENTER.longitude;

  const polygonData = useMemo(
    () => circlePolygonCollection(pinLng, pinLat, radiusMeters),
    [pinLng, pinLat, radiusMeters]
  );
  const outlineData = useMemo(
    () => circleOutlineCollection(pinLng, pinLat, radiusMeters),
    [pinLng, pinLat, radiusMeters]
  );

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    cameraRef.current?.jumpTo({
      center: [longitude, latitude],
      zoom: PICKER_ZOOM,
    });
  }, [latitude, longitude]);

  return (
    <View style={styles.mapWrapper}>
      <Map
        style={mapStyle}
        mapStyle={MAP_STYLE_URL}
        onPress={(event) => {
          const [lng, lat] = event.nativeEvent.lngLat;
          onPick(lat, lng);
        }}
        onRegionDidChange={(event) => {
          if (!event.nativeEvent.userInteraction) return;
          const [lng, lat] = event.nativeEvent.center;
          onPick(lat, lng);
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: [pinLng, pinLat], zoom: PICKER_ZOOM }}
        />
        <GeoJSONSource id="picker-radius-fill" data={polygonData}>
          <Layer
            id="picker-radius-fill-layer"
            type="fill"
            paint={{ "fill-color": "#2563EB", "fill-opacity": 0.15 }}
          />
        </GeoJSONSource>
        <GeoJSONSource id="picker-radius-outline" data={outlineData}>
          <Layer
            id="picker-radius-line-layer"
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
      {onEnlarge && (
        <Pressable
          onPress={onEnlarge}
          style={[styles.enlargeButton, { backgroundColor: colors.surface }]}
          hitSlop={8}
          accessibilityLabel="Enlarge map"
        >
          <Ionicons name="expand" size={20} color={colors.text} />
        </Pressable>
      )}
    </View>
  );
}

interface RadiusControlProps {
  radiusMeters: number;
  onRadiusChange: (radius: number) => void;
}

function RadiusControl({ radiusMeters, onRadiusChange }: RadiusControlProps) {
  const { colors } = useTheme();
  return (
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
  );
}

export function LocationPickerMapLibre(props: LocationPickerProps) {
  const {
    latitude,
    longitude,
    radiusMeters,
    locationName,
    onLocationChange,
    onLocationNameChange,
    onRadiusChange,
  } = props;
  const { colors } = useTheme();
  const [hasInitializedLocation, setHasInitializedLocation] = useState(
    latitude != null && longitude != null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReverse = useCallback(
    (lat: number, lng: number) => {
      if (reverseTimer.current) clearTimeout(reverseTimer.current);
      reverseTimer.current = setTimeout(async () => {
        const name = await reverseGeocode(lat, lng);
        if (name) onLocationNameChange(name);
      }, REVERSE_DEBOUNCE_MS);
    },
    [onLocationNameChange]
  );

  useEffect(() => {
    return () => {
      if (reverseTimer.current) clearTimeout(reverseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (hasInitializedLocation) return;

    getCurrentLocation().then((loc) => {
      if (loc) {
        onLocationChange(loc.latitude, loc.longitude);
        scheduleReverse(loc.latitude, loc.longitude);
      } else {
        onLocationChange(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);
      }
      setHasInitializedLocation(true);
    });
  }, [hasInitializedLocation, onLocationChange, scheduleReverse]);

  const handleMapPick = useCallback(
    (lat: number, lng: number) => {
      onLocationChange(lat, lng);
      scheduleReverse(lat, lng);
    },
    [onLocationChange, scheduleReverse]
  );

  const handleSelectPlace = useCallback(
    (place: GeocodeResult) => {
      if (reverseTimer.current) clearTimeout(reverseTimer.current);
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
      <View style={styles.mapBlock}>
        <MapArea
          latitude={latitude}
          longitude={longitude}
          radiusMeters={radiusMeters}
          onPick={handleMapPick}
          onEnlarge={() => setIsFullscreen(true)}
          mapStyle={styles.map}
        />
      </View>
      <RadiusControl radiusMeters={radiusMeters} onRadiusChange={onRadiusChange} />

      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <SafeAreaView
          style={[styles.fullscreen, { backgroundColor: colors.background }]}
          edges={["top", "bottom"]}
        >
          <View style={styles.fullscreenHeader}>
            <Text style={[styles.fullscreenTitle, { color: colors.text }]}>
              Pick location
            </Text>
            <Pressable
              onPress={() => setIsFullscreen(false)}
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.fullscreenSearch}>
            <PlaceSearchInput
              value={locationName}
              onChangeText={onLocationNameChange}
              onSelectPlace={handleSelectPlace}
              placeholder="Search for a place"
            />
          </View>
          <MapArea
            latitude={latitude}
            longitude={longitude}
            radiusMeters={radiusMeters}
            onPick={handleMapPick}
            mapStyle={styles.mapFull}
          />
          <RadiusControl
            radiusMeters={radiusMeters}
            onRadiusChange={onRadiusChange}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  mapBlock: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  mapWrapper: {
    position: "relative",
    flex: 1,
  },
  map: {
    height: 220,
    width: "100%",
  },
  mapFull: {
    flex: 1,
    width: "100%",
  },
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -14,
    marginTop: -36,
  },
  enlargeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
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
  fullscreen: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullscreenTitle: {
    ...typography.title,
    fontSize: 20,
  },
  fullscreenSearch: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  doneButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  doneButtonText: {
    color: "#FFFFFF",
    ...typography.label,
    fontWeight: "600",
  },
});
