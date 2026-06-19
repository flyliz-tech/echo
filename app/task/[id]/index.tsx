import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Feedback, FeedbackToast } from "@/components/FeedbackToast";
import { useTheme } from "@/hooks/useTheme";
import { layout, radius, shadow, spacing, typography } from "@/constants/theme";
import { formatDateTime, formatTriggerTimeFull } from "@/lib/utils/formatTaskTime";
import { PRIORITY_META, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export default function ViewTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const task = useTaskStore((s) => s.getTaskById(id));
  const deleteTaskWithUndo = useTaskStore((s) => s.deleteTaskWithUndo);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const nonceRef = useRef(0);

  const showFeedback = (message: string, type: Feedback["type"]) => {
    setFeedback({ message, type, nonce: ++nonceRef.current });
    Haptics.notificationAsync(
      type === "success"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  };

  const handleCopyNotes = async () => {
    if (!task?.notes) return;
    try {
      await Clipboard.setStringAsync(task.notes);
      showFeedback("Notes copied to clipboard", "success");
    } catch {
      showFeedback("Couldn't copy notes", "error");
    }
  };

  const handleShareNotes = async () => {
    if (!task?.notes) return;
    try {
      const result = await Share.share({ message: task.notes });
      if (result.action === Share.sharedAction) {
        showFeedback("Notes shared", "success");
      }
    } catch {
      showFeedback("Couldn't share notes", "error");
    }
  };

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

        <View style={styles.row}>
          <Text style={styles.priorityEmoji}>
            {PRIORITY_META[task.priority].emoji}
          </Text>
          <Text
            style={[
              styles.priorityLabel,
              { color: PRIORITY_META[task.priority].color },
            ]}
          >
            {PRIORITY_META[task.priority].label} priority
          </Text>
        </View>

        {hasTimeTrigger(task) && task.triggerTime && (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.detail, { color: colors.text }]}>
              {formatTriggerTimeFull(task.triggerTime)}
            </Text>
          </View>
        )}

        {hasLocationTrigger(task) && (
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
            <View style={styles.notesHeader}>
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                Notes
              </Text>
              <View style={styles.notesActions}>
                <Pressable
                  onPress={handleCopyNotes}
                  hitSlop={8}
                  accessibilityLabel="Copy notes"
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </Pressable>
                <Pressable
                  onPress={handleShareNotes}
                  hitSlop={8}
                  accessibilityLabel="Share notes"
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              </View>
            </View>
            <Text style={[styles.notes, { color: colors.text }]}>{task.notes}</Text>
          </View>
        )}

        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Ionicons
              name="add-circle-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Created {formatDateTime(task.createdAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name="create-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Modified {formatDateTime(task.updatedAt)}
            </Text>
          </View>
          {task.completedAt && (
            <View style={styles.metaRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {task.isCompleted ? "Completed" : "Previously completed"}{" "}
                {formatDateTime(task.completedAt)}
              </Text>
            </View>
          )}
          {task.reopenedAt && !task.isCompleted && (
            <View style={styles.metaRow}>
              <Ionicons
                name="refresh-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Reopened {formatDateTime(task.reopenedAt)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {!task.isCompleted && (
            <Pressable
              onPress={() => router.push(`/task/${task.id}/edit`)}
              style={({ pressed }) => [
                styles.button,
                shadow.sm,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={20} color={colors.onPrimary} />
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                Edit
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.dangerMuted,
                borderColor: colors.danger,
                borderWidth: 1,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.buttonText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>

      <FeedbackToast feedback={feedback} onHidden={() => setFeedback(null)} />
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
  priorityEmoji: {
    fontSize: 14,
  },
  priorityLabel: {
    ...typography.label,
    fontWeight: "700",
  },
  notesBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  notesActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notesLabel: {
    ...typography.label,
  },
  notes: {
    ...typography.body,
    lineHeight: 22,
  },
  metaBox: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: layout.buttonHeight,
    borderRadius: radius.md,
  },
  buttonText: {
    ...typography.label,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.85,
  },
});
