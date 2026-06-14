import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { LocationPicker } from "@/components/LocationPicker";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import {
  CreateTaskInput,
  NOTES_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  deriveTriggerType,
  validateTaskInput,
} from "@/lib/types/task";

export interface TaskFormValues {
  title: string;
  notes: string;
  hasTimeTrigger: boolean;
  triggerTime: Date | null;
  hasLocationTrigger: boolean;
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  radiusMeters: number;
}

interface TaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: TaskFormValues = {
  title: "",
  notes: "",
  hasTimeTrigger: false,
  triggerTime: null,
  hasLocationTrigger: false,
  latitude: null,
  longitude: null,
  locationName: "",
  radiusMeters: 150,
};

export function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: TaskFormProps) {
  const { colors } = useTheme();
  const [values, setValues] = useState<TaskFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (patch: Partial<TaskFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const handleSubmit = async () => {
    const input: CreateTaskInput = {
      title: values.title,
      notes: values.notes || null,
      triggerTime:
        values.hasTimeTrigger && values.triggerTime
          ? values.triggerTime.toISOString()
          : null,
      latitude: values.hasLocationTrigger ? values.latitude : null,
      longitude: values.hasLocationTrigger ? values.longitude : null,
      locationName: values.hasLocationTrigger
        ? values.locationName || null
        : null,
      radiusMeters: values.radiusMeters,
      triggerType: deriveTriggerType({
        latitude: values.hasLocationTrigger ? values.latitude : null,
        longitude: values.hasLocationTrigger ? values.longitude : null,
        triggerTime:
          values.hasTimeTrigger && values.triggerTime
            ? values.triggerTime.toISOString()
            : null,
      }),
    };

    const validationError = validateTaskInput(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Title ({values.title.length}/{TITLE_MAX_LENGTH})
        </Text>
        <TextInput
          value={values.title}
          onChangeText={(title) => update({ title })}
          placeholder="Enter title of task"
          placeholderTextColor={colors.textSecondary}
          maxLength={TITLE_MAX_LENGTH}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Time trigger
          </Text>
          <Switch
            value={values.hasTimeTrigger}
            onValueChange={(hasTimeTrigger) => {
              update({
                hasTimeTrigger,
                triggerTime: hasTimeTrigger
                  ? values.triggerTime ?? new Date()
                  : values.triggerTime,
              });
            }}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {values.hasTimeTrigger && (
          <>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.pickerButton, { borderColor: colors.border }]}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickerText, { color: colors.text }]}>
                {values.triggerTime
                  ? values.triggerTime.toLocaleString()
                  : "Select date and time"}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={values.triggerTime ?? new Date()}
                mode="datetime"
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) update({ triggerTime: date });
                }}
              />
            )}
          </>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Location trigger
          </Text>
          <Switch
            value={values.hasLocationTrigger}
            onValueChange={(hasLocationTrigger) => update({ hasLocationTrigger })}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {values.hasLocationTrigger && (
          <>
            <TextInput
              value={values.locationName}
              onChangeText={(locationName) => update({ locationName })}
              placeholder="Location name (e.g. Navami, Moodbidri)"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  marginBottom: spacing.sm,
                },
              ]}
            />
            <LocationPicker
              latitude={values.latitude}
              longitude={values.longitude}
              radiusMeters={values.radiusMeters}
              onLocationChange={(latitude, longitude) =>
                update({ latitude, longitude })
              }
              onRadiusChange={(radiusMeters) => update({ radiusMeters })}
            />
          </>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Notes ({values.notes.length}/{NOTES_MAX_LENGTH})
        </Text>
        <TextInput
          value={values.notes}
          onChangeText={(notes) => update({ notes })}
          placeholder="Add notes or description"
          placeholderTextColor={colors.textSecondary}
          maxLength={NOTES_MAX_LENGTH}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[
            styles.input,
            styles.notesInput,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={onCancel}
          style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.button,
            styles.saveButton,
            { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
            {submitLabel}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  section: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  pickerText: {
    ...typography.body,
    flex: 1,
  },
  error: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    ...typography.label,
    fontWeight: "600",
  },
});
