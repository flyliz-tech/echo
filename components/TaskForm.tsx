import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
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
import { EchoCard } from "@/components/ui/EchoCard";
import { GhostButton } from "@/components/ui/GhostButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PriorityPills } from "@/components/ui/PriorityPills";
import { useTheme } from "@/hooks/useTheme";
import { layout, radius, spacing, typography } from "@/constants/theme";
import {
  CreateTaskInput,
  DEFAULT_PRIORITY,
  NOTES_MAX_LENGTH,
  Priority,
  TITLE_MAX_LENGTH,
  deriveTriggerType,
  validateTaskInput,
} from "@/lib/types/task";

export interface TaskFormValues {
  title: string;
  notes: string;
  priority: Priority;
  timeEnabled: boolean;
  locationEnabled: boolean;
  triggerTime: Date | null;
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
  priority: DEFAULT_PRIORITY,
  timeEnabled: false,
  locationEnabled: false,
  triggerTime: null,
  latitude: null,
  longitude: null,
  locationName: "",
  radiusMeters: 150,
};

function toValidDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: TaskFormProps) {
  const { colors } = useTheme();
  const [values, setValues] = useState<TaskFormValues>(() => {
    const merged = { ...defaultValues, ...initialValues };
    return { ...merged, triggerTime: toValidDate(merged.triggerTime) };
  });
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const update = (patch: Partial<TaskFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const triggerDate = toValidDate(values.triggerTime);

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      const initial = triggerDate ?? new Date();
      DateTimePickerAndroid.open({
        value: initial,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) return;
          const result = new Date(initial);
          result.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );
          update({ triggerTime: result });
        },
      });
      return;
    }
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    if (Platform.OS === "android") {
      const initial = triggerDate ?? new Date();
      DateTimePickerAndroid.open({
        value: initial,
        mode: "time",
        is24Hour: false,
        onChange: (event, selectedTime) => {
          if (event.type !== "set" || !selectedTime) return;
          const result = new Date(initial);
          result.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
          update({ triggerTime: result });
        },
      });
      return;
    }
    setShowTimePicker(true);
  };

  const handleSubmit = async () => {
    const input: CreateTaskInput = {
      title: values.title,
      notes: values.notes || null,
      priority: values.priority,
      timeEnabled: values.timeEnabled,
      locationEnabled: values.locationEnabled,
      triggerTime:
        values.timeEnabled && values.triggerTime
          ? values.triggerTime.toISOString()
          : null,
      latitude: values.locationEnabled ? values.latitude : null,
      longitude: values.locationEnabled ? values.longitude : null,
      locationName:
        values.locationEnabled && values.locationName
          ? values.locationName
          : null,
      radiusMeters: values.radiusMeters,
      triggerType: deriveTriggerType({
        timeEnabled: values.timeEnabled,
        locationEnabled: values.locationEnabled,
        latitude: values.locationEnabled ? values.latitude : null,
        longitude: values.locationEnabled ? values.longitude : null,
        triggerTime:
          values.timeEnabled && values.triggerTime
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
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <TextInput
            value={values.title}
            onChangeText={(title) => update({ title })}
            placeholder="Task title"
            placeholderTextColor={colors.textSecondary}
            maxLength={TITLE_MAX_LENGTH}
            style={[styles.titleInput, { color: colors.text }]}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>
            {values.title.length}/{TITLE_MAX_LENGTH}
          </Text>
        </View>

        <PriorityPills
          value={values.priority}
          onChange={(priority) => update({ priority })}
        />

        <EchoCard style={styles.reminderCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Time Reminder
            </Text>
            <Switch
              value={values.timeEnabled}
              onValueChange={(timeEnabled) => {
                if (!timeEnabled) {
                  update({ timeEnabled: false, triggerTime: null });
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                  return;
                }
                update({
                  timeEnabled: true,
                  triggerTime: triggerDate ?? new Date(),
                });
              }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={values.timeEnabled ? colors.primary : colors.surface}
            />
          </View>
          {values.timeEnabled && (
            <View style={styles.dateTimeRow}>
              <Pressable
                onPress={openDatePicker}
                style={[
                  styles.dateField,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
              >
                <Text style={[styles.fieldText, { color: colors.text }]}>
                  {triggerDate
                    ? format(triggerDate, "MMMM dd, yyyy")
                    : "Select date"}
                </Text>
                <Ionicons name="calendar" size={18} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={openTimePicker}
                style={[
                  styles.dateField,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
              >
                <Text style={[styles.fieldText, { color: colors.text }]}>
                  {triggerDate ? format(triggerDate, "hh:mm a") : "Select time"}
                </Text>
                <Ionicons name="time" size={18} color={colors.primary} />
              </Pressable>
            </View>
          )}
          {showDatePicker && Platform.OS === "ios" && (
            <DateTimePicker
              value={triggerDate ?? new Date()}
              mode="date"
              display="spinner"
              onChange={(_, date) => {
                if (date) update({ triggerTime: date });
              }}
            />
          )}
          {showTimePicker && Platform.OS === "ios" && (
            <DateTimePicker
              value={triggerDate ?? new Date()}
              mode="time"
              display="spinner"
              onChange={(_, date) => {
                if (date) update({ triggerTime: date });
              }}
            />
          )}
        </EchoCard>

        <EchoCard style={styles.reminderCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Location Reminder
            </Text>
            <Switch
              value={values.locationEnabled}
              onValueChange={(locationEnabled) => {
                if (!locationEnabled) {
                  update({
                    locationEnabled: false,
                    latitude: null,
                    longitude: null,
                    locationName: "",
                  });
                  return;
                }
                update({ locationEnabled: true });
              }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={
                values.locationEnabled ? colors.primary : colors.surface
              }
            />
          </View>
          {values.locationEnabled && (
            <>
              <LocationPicker
                latitude={values.latitude}
                longitude={values.longitude}
                radiusMeters={values.radiusMeters}
                locationName={values.locationName}
                onLocationChange={(latitude, longitude) =>
                  update({ latitude, longitude })
                }
                onLocationNameChange={(locationName) =>
                  update({ locationName })
                }
                onRadiusChange={(radiusMeters) => update({ radiusMeters })}
              />
              <View style={styles.radiusRow}>
                <Text style={[styles.radiusLabel, { color: colors.textSecondary }]}>
                  Radius
                </Text>
                <Text style={[styles.radiusValue, { color: colors.primary }]}>
                  {values.radiusMeters}m
                </Text>
              </View>
            </>
          )}
        </EchoCard>

        <View style={styles.notesSection}>
          <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
            Notes ({values.notes.length}/{NOTES_MAX_LENGTH})
          </Text>
          <TextInput
            value={values.notes}
            onChangeText={(notes) => update({ notes })}
            placeholder="Add notes (optional)"
            placeholderTextColor={colors.textSecondary}
            maxLength={NOTES_MAX_LENGTH}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.notesInput,
              {
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
          />
        </View>

        {error && (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <GhostButton label="Cancel" onPress={onCancel} />
        <View style={styles.saveWrap}>
          <PrimaryButton
            label={submitLabel}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  titleBlock: {
    marginBottom: spacing.md,
  },
  titleInput: {
    ...typography.headlineLg,
    fontSize: 28,
    padding: 0,
  },
  counter: {
    ...typography.caption,
    textAlign: "right",
    marginTop: spacing.xs,
  },
  reminderCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.headlineMd,
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minHeight: layout.controlHeight,
  },
  fieldText: {
    ...typography.bodyMd,
    flex: 1,
  },
  radiusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  radiusLabel: {
    ...typography.bodyMd,
  },
  radiusValue: {
    ...typography.label,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
  },
  notesSection: {
    marginBottom: spacing.md,
  },
  notesLabel: {
    ...typography.labelSm,
    letterSpacing: 0,
    marginBottom: spacing.sm,
  },
  notesInput: {
    minHeight: 100,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...typography.body,
    lineHeight: 22,
  },
  error: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  saveWrap: {
    flex: 1,
  },
});
