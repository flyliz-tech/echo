import { Ionicons } from "@expo/vector-icons";
import { Camera, type CameraRef, MapView, PointAnnotation } from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPin } from "@/components/MapPin";
import { useTheme } from "@/hooks/useTheme";
import { configureMapbox } from "@/lib/services/mapbox";
import { layout, radius, shadow, spacing, typography } from "@/constants/theme";
import {
  DEFAULT_CENTER,
  latitudeDeltaToZoom,
  MAP_STYLE_URL,
  RECENTER_ZOOM,
} from "@/constants/map";
import { Task, hasLocationTrigger } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";
import { useTaskStore } from "@/lib/store/taskStore";

export default function MapTabScreenMapbox() {
  configureMapbox();
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const moveCameraTo = useCallback(
    (center: [number, number], duration = 800) => {
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: RECENTER_ZOOM,
        heading: 0,
        pitch: 0,
        animationDuration: duration,
      });
    },
    []
  );

  const fetchCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return [position.coords.longitude, position.coords.latitude] as [number, number];
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const center = await fetchCurrentLocation();
        if (!center || cancelled) return;
        setUserLocation(center);
        moveCameraTo(center, 0);
      } catch {
        // keep fallback center when location is unavailable
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [fetchCurrentLocation, moveCameraTo]);

  const recenter = useCallback(async () => {
    if (locating) return;
    setLocating(true);
    try {
      const center = await fetchCurrentLocation();
      if (!center) {
        Alert.alert(
          "Location needed",
          "Enable location access to center the map on your current position."
        );
        return;
      }
      setUserLocation(center);
      moveCameraTo(center);
    } catch {
      Alert.alert(
        "Location unavailable",
        "Couldn't get your current location. Please try again."
      );
    } finally {
      setLocating(false);
    }
  }, [fetchCurrentLocation, locating, moveCameraTo]);

  const locationTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.isCompleted &&
          hasLocationTrigger(t) &&
          t.latitude != null &&
          t.longitude != null
      ),
    [tasks]
  );

  const initialCenter = useMemo<[number, number]>(() => {
    const first = locationTasks[0];
    if (first?.latitude != null && first.longitude != null) {
      return [first.longitude, first.latitude];
    }
    return [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude];
  }, [locationTasks]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={MAP_STYLE_URL}
        logoEnabled
        attributionEnabled
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: initialCenter,
            zoomLevel: latitudeDeltaToZoom(0.08),
            heading: 0,
            pitch: 0,
          }}
        />
        {userLocation && (
          <PointAnnotation
            id="user-location"
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[styles.userDotRing, { backgroundColor: colors.primaryMuted }]}
            >
              <View style={[styles.userDot, { backgroundColor: colors.primary }]} />
            </View>
          </PointAnnotation>
        )}
        {locationTasks.map((task) => (
          <PointAnnotation
            key={task.id}
            id={task.id}
            coordinate={[task.longitude!, task.latitude!]}
            anchor={{ x: 0.5, y: 1 }}
            onSelected={() => setSelectedTask(task)}
          >
            <MapPin size={32} />
          </PointAnnotation>
        ))}
      </MapView>

      {selectedTask && (
        <SafeAreaView style={styles.tooltipWrapper} edges={["bottom"]}>
          <View
            style={[
              styles.tooltip,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.tooltipTitle, { color: colors.text }]}>
              {selectedTask.title}
            </Text>
            {selectedTask.triggerTime && (
              <Text style={[styles.tooltipDetail, { color: colors.textSecondary }]}>
                {formatTriggerTime(selectedTask.triggerTime)}
              </Text>
            )}
            {selectedTask.locationName && (
              <Text style={[styles.tooltipDetail, { color: colors.textSecondary }]}>
                {selectedTask.locationName}
              </Text>
            )}
            <Pressable
              onPress={() => {
                router.push(`/task/${selectedTask.id}`);
                setSelectedTask(null);
              }}
              style={[styles.viewButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.viewButtonText, { color: colors.onPrimary }]}>
                View task
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {locationTasks.length === 0 && (
        <View style={[styles.emptyBanner, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No location tasks to show on the map
          </Text>
        </View>
      )}

      <Pressable
        onPress={recenter}
        disabled={locating}
        style={[
          styles.recenterButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        hitSlop={8}
        accessibilityLabel="Center on my location"
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={22} color={colors.text} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  tooltipWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  tooltip: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.md,
  },
  tooltipTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  tooltipDetail: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  viewButton: {
    marginTop: spacing.sm,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
    borderRadius: radius.md,
    alignItems: "center",
  },
  viewButtonText: {
    ...typography.label,
    fontWeight: "600",
  },
  emptyBanner: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    ...shadow.sm,
  },
  emptyText: {
    ...typography.caption,
  },
  recenterButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  userDotRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
