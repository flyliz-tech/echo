import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import { formatTriggerTimeFull } from "@/lib/utils/formatTaskTime";
import { useTaskStore } from "@/lib/store/taskStore";

export default function ViewTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const task = useTaskStore((s) => s.getTaskById(id));
  const deleteTaskWithUndo = useTaskStore((s) => s.deleteTaskWithUndo);

  if (!task) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Task not found</Text>
      </View>
    );
  }

  const handleDelete = async () => {
    await deleteTaskWithUndo(task.id);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>

        {task.triggerType === "time" && task.triggerTime && (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.detail, { color: colors.text }]}>
              {formatTriggerTimeFull(task.triggerTime)}
            </Text>
          </View>
        )}

        {task.triggerType === "location" && (
          <>
            {task.locationName && (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={[styles.detail, { color: colors.text }]}>
                  {task.locationName}
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <Ionicons name="radio-outline" size={20} color={colors.primary} />
              <Text style={[styles.detail, { color: colors.text }]}>
                {task.radiusMeters} m trigger radius
              </Text>
            </View>
          </>
        )}

        {task.notes && (
          <View style={[styles.notesBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
              Notes
            </Text>
            <Text style={[styles.notes, { color: colors.text }]}>{task.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push(`/task/${task.id}/edit`)}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={[styles.button, { backgroundColor: colors.dangerMuted, borderColor: colors.danger, borderWidth: 1 }]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.buttonText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detail: {
    ...typography.body,
    flex: 1,
  },
  notesBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  notesLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  notes: {
    ...typography.body,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  buttonText: {
    ...typography.label,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
