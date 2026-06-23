import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EchoCard } from "@/components/ui/EchoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TriggerChip } from "@/components/ui/TriggerChip";
import { useTheme } from "@/hooks/useTheme";
import { layout, radius, spacing, typography } from "@/constants/theme";
import { PRIORITY_META } from "@/lib/types/task";
import { formatDateTime, formatTriggerTimeFull } from "@/lib/utils/formatTaskTime";
import { hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
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

  const priorityMeta = PRIORITY_META[task.priority];

  const copyNotes = async () => {
    if (task.notes) await Clipboard.setStringAsync(task.notes);
  };

  const shareNotes = async () => {
    if (!task.notes) return;
    await Share.share({ message: task.notes });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: `${priorityMeta.dotColor}20` },
            ]}
          >
            <View
              style={[styles.priorityDot, { backgroundColor: priorityMeta.dotColor }]}
            />
            <Text style={[styles.priorityText, { color: priorityMeta.dotColor }]}>
              {priorityMeta.label}
            </Text>
          </View>
        </View>

        <View style={styles.chips}>
          {hasTimeTrigger(task) && task.triggerTime && (
            <TriggerChip
              type="time"
              label={formatTriggerTimeFull(task.triggerTime)}
            />
          )}
          {hasLocationTrigger(task) && task.locationName && (
            <TriggerChip type="location" label={task.locationName} />
          )}
        </View>

        {hasLocationTrigger(task) && (
          <View style={styles.row}>
            <Ionicons name="radio-outline" size={20} color={colors.primary} />
            <Text style={[styles.detail, { color: colors.text }]}>
              {task.radiusMeters} m trigger radius
            </Text>
          </View>
        )}

        {task.notes && (
          <EchoCard style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                Notes
              </Text>
              <View style={styles.notesActions}>
                <Pressable onPress={copyNotes} hitSlop={8}>
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={shareNotes} hitSlop={8}>
                  <Ionicons name="share-outline" size={20} color={colors.primary} />
                </Pressable>
              </View>
            </View>
            <Text style={[styles.notes, { color: colors.text }]}>{task.notes}</Text>
          </EchoCard>
        )}

        <View style={styles.metaBox}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Created {formatDateTime(task.createdAt)}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Modified {formatDateTime(task.updatedAt)}
          </Text>
        </View>

        <View style={styles.actions}>
          {!task.isCompleted && (
            <PrimaryButton
              label="Edit"
              onPress={() => router.push(`/task/${task.id}/edit`)}
            />
          )}
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              {
                borderColor: colors.danger,
                backgroundColor: colors.dangerMuted,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.deleteText, { color: colors.danger }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: spacing.md },
  titleRow: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    fontSize: 32,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    ...typography.labelSm,
    letterSpacing: 0,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detail: { ...typography.body, flex: 1 },
  notesCard: { marginBottom: spacing.lg },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  notesLabel: { ...typography.label },
  notesActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  notes: { ...typography.body, lineHeight: 22 },
  metaBox: { marginTop: spacing.sm, gap: spacing.xs },
  metaText: { ...typography.caption },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: layout.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  deleteText: {
    ...typography.label,
    fontWeight: "600",
  },
  pressed: { opacity: 0.85 },
});
