import { Camera, Map, Marker } from "@maplibre/maplibre-react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { EchoCard } from "@/components/ui/EchoCard";
import { useTheme } from "@/hooks/useTheme";
import { latitudeDeltaToZoom, MAP_STYLE_URL } from "@/constants/map";
import { radius, spacing, typography } from "@/constants/theme";
import { hasLocationTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export function MapPreviewCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);

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
        zoom: latitudeDeltaToZoom(0.05),
      };
    }
    return { center: [0, 0] as [number, number], zoom: 10 };
  }, [locationTasks]);

  if (locationTasks.length === 0) return null;

  return (
    <Pressable onPress={() => router.push("/(tabs)/map")}>
      <EchoCard style={styles.card} elevated>
        <View style={styles.mapContainer}>
          <Map
            style={styles.map}
            mapStyle={MAP_STYLE_URL}
            logo={false}
            attribution={false}
          >
            <Camera initialViewState={initialViewState} />
            {locationTasks.slice(0, 5).map((task) => (
              <Marker
                key={task.id}
                id={task.id}
                lngLat={[task.longitude!, task.latitude!]}
                anchor="bottom"
              >
                <View
                  style={[styles.pin, { backgroundColor: colors.primary }]}
                />
              </Marker>
            ))}
          </Map>
          <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
            <Ionicons name="navigate" size={16} color={colors.primary} />
            <Text style={[styles.overlayText, { color: colors.text }]}>
              {locationTasks.length} task{locationTasks.length !== 1 ? "s" : ""}{" "}
              nearby
            </Text>
          </View>
        </View>
      </EchoCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  mapContainer: {
    height: 128,
    position: "relative",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  pin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  overlay: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    marginTop: -16,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    opacity: 0.95,
  },
  overlayText: {
    ...typography.labelSm,
    letterSpacing: 0,
  },
});
