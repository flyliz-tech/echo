import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { EchoCard } from "@/components/ui/EchoCard";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { hasLocationTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export function MapPreviewCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);

  const locationTasks = tasks.filter(
    (t) =>
      !t.isCompleted &&
      hasLocationTrigger(t) &&
      t.latitude != null &&
      t.longitude != null
  );

  if (locationTasks.length === 0) return null;

  return (
    <Pressable onPress={() => router.push("/(tabs)/map")}>
      <EchoCard style={styles.card} elevated>
        <View
          style={[
            styles.placeholder,
            { backgroundColor: colors.surfaceContainer },
          ]}
        >
          <Ionicons name="map" size={32} color={colors.primary} />
          <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
            <Ionicons name="navigate" size={16} color={colors.primary} />
            <Text style={[styles.overlayText, { color: colors.text }]}>
              {locationTasks.length} task
              {locationTasks.length !== 1 ? "s" : ""} nearby
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
  placeholder: {
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  overlayText: {
    ...typography.labelSm,
    letterSpacing: 0,
  },
});
