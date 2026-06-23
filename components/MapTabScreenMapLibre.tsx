import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  type CameraRef,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { EchoCard } from "@/components/ui/EchoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TriggerChip } from "@/components/ui/TriggerChip";
import { useTheme } from "@/hooks/useTheme";
import { elevationStyles, layout, radius, spacing, typography } from "@/constants/theme";
import {
  DEFAULT_CENTER,
  latitudeDeltaToZoom,
  MAP_STYLE_URL,
  RECENTER_ZOOM,
} from "@/constants/map";
import { Task, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";
import { useTaskStore } from "@/lib/store/taskStore";

export default function MapTabScreenMapLibre() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const recenter = useCallback(async () => {
    if (locating) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location needed",
          "Enable location access to center the map on your current position."
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const center: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      setUserLocation(center);
      cameraRef.current?.flyTo({ center, zoom: RECENTER_ZOOM, duration: 800 });
    } catch {
      Alert.alert(
        "Location unavailable",
        "Couldn't get your current location. Please try again."
      );
    } finally {
      setLocating(false);
    }
  }, [locating]);

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

  const initialViewState = useMemo(() => {
    const first = locationTasks[0];
    if (first?.latitude != null && first.longitude != null) {
      return {
        center: [first.longitude, first.latitude] as [number, number],
        zoom: latitudeDeltaToZoom(0.08),
      };
    }
    return {
      center: [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude] as [
        number,
        number,
      ],
      zoom: latitudeDeltaToZoom(0.08),
    };
  }, [locationTasks]);

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        logo={false}
        attribution={false}
      >
        <Camera ref={cameraRef} initialViewState={initialViewState} />
        {userLocation && (
          <Marker id="user-location" lngLat={userLocation} anchor="center">
            <View style={[styles.userDotRing, { backgroundColor: colors.primaryMuted }]}>
              <View style={[styles.userDot, { backgroundColor: colors.primary }]} />
            </View>
          </Marker>
        )}
        {locationTasks.map((task) => (
          <Marker
            key={task.id}
            id={task.id}
            lngLat={[task.longitude!, task.latitude!]}
            anchor="bottom"
            onPress={() => setSelectedTask(task)}
          >
            <MapPin size={32} triggerType={task.triggerType} />
          </Marker>
        ))}
      </Map>

      {selectedTask && (
        <SafeAreaView style={styles.sheetWrapper} edges={["bottom"]}>
          <EchoCard style={styles.sheet} elevated>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {selectedTask.title}
            </Text>
            <View style={styles.chips}>
              {hasTimeTrigger(selectedTask) && selectedTask.triggerTime && (
                <TriggerChip
                  type="time"
                  label={formatTriggerTime(selectedTask.triggerTime)}
                />
              )}
              {hasLocationTrigger(selectedTask) && selectedTask.locationName && (
                <TriggerChip
                  type="location"
                  label={selectedTask.locationName}
                />
              )}
            </View>
            <PrimaryButton
              label="View task →"
              onPress={() => {
                router.push(`/task/${selectedTask.id}`);
                setSelectedTask(null);
              }}
            />
          </EchoCard>
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
  sheetWrapper: {
    position: "absolute",
    bottom: layout.tabBarHeight,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  sheet: {
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.headlineLg,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  emptyBanner: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    ...elevationStyles.level1,
  },
  emptyText: {
    ...typography.caption,
  },
  recenterButton: {
    position: "absolute",
    bottom: layout.tabBarHeight + spacing.xl * 2,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...elevationStyles.level2,
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
