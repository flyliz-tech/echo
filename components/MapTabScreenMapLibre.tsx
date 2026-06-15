import {
  Camera,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPin } from "@/components/MapPin";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import {
  DEFAULT_CENTER,
  latitudeDeltaToZoom,
  MAP_STYLE_URL,
} from "@/constants/map";
import { Task, hasLocationTrigger } from "@/lib/types/task";
import { formatTriggerTime } from "@/lib/utils/formatTaskTime";
import { useTaskStore } from "@/lib/store/taskStore";

export default function MapTabScreenMapLibre() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      <Map style={styles.map} mapStyle={MAP_STYLE_URL}>
        <Camera initialViewState={initialViewState} />
        {locationTasks.map((task) => (
          <Marker
            key={task.id}
            id={task.id}
            lngLat={[task.longitude!, task.latitude!]}
            anchor="bottom"
            onPress={() => setSelectedTask(task)}
          >
            <MapPin size={32} />
          </Marker>
        ))}
      </Map>

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
              <Text style={styles.viewButtonText}>View task</Text>
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
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
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#FFFFFF",
    ...typography.label,
    fontWeight: "600",
  },
  emptyBanner: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  emptyText: {
    ...typography.caption,
  },
});
