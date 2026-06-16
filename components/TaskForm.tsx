import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
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
import { useTheme } from "@/hooks/useTheme";
import { layout, radius, shadow, spacing, typography } from "@/constants/theme";
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
  timeEnabled: false,
  locationEnabled: false,
  triggerTime: null,
  latitude: null,
  longitude: null,
  locationName: "",
  radiusMeters: 150,
};

/**
 * Normalizes a trigger time (which may arrive as a Date, an ISO string from
 * persisted data, null, or an unparseable value) into a valid Date or null.
 * The native DateTimePicker crashes if handed a string or an Invalid Date
 * (NaN timestamp), so every value reaching the picker must pass through here.
 */
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

  // Always derive a guaranteed-valid Date for any picker/display usage.
  const triggerDate = toValidDate(values.triggerTime);

  const openDateTimePicker = () => {
    if (Platform.OS === "android") {
      const initial = toValidDate(values.triggerTime) ?? new Date();
      DateTimePickerAndroid.open({
        value: initial,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) return;

          const withDate = new Date(initial);
          withDate.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );

          DateTimePickerAndroid.open({
            value: withDate,
            mode: "time",
            is24Hour: false,
            design: "material",
            initialInputMode: "keyboard",
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type !== "set" || !selectedTime) return;
              const result = new Date(withDate);
              result.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                0,
                0
              );
              update({ triggerTime: result });
            },
          });
        },
      });
      return;
    }

    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    const input: CreateTaskInput = {
      title: values.title,
      notes: values.notes || null,
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
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.triggerHeader}>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
            Time reminder
          </Text>
          <Switch
            value={values.timeEnabled}
            onValueChange={(timeEnabled) => {
              if (!timeEnabled) {
                update({ timeEnabled: false, triggerTime: null });
                setShowDatePicker(false);
                return;
              }
              update({
                timeEnabled: true,
                triggerTime: toValidDate(values.triggerTime) ?? new Date(),
              });
            }}
            trackColor={{ false: colors.border, true: colors.primaryMuted }}
            thumbColor={values.timeEnabled ? colors.primary : colors.surface}
          />
        </View>
        {values.timeEnabled ? (
          <>
            <Pressable
              onPress={openDateTimePicker}
              style={[styles.pickerButton, { borderColor: colors.border }]}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickerText, { color: colors.text }]}>
                {triggerDate
                  ? triggerDate.toLocaleString()
                  : "Select date and time"}
              </Text>
            </Pressable>
            {showDatePicker && Platform.OS === "ios" && (
              <View style={styles.iosDatePicker}>
                <DateTimePicker
                  value={triggerDate ?? new Date()}
                  mode="datetime"
                  display="spinner"
                  onChange={(_, date) => {
                    if (date) update({ triggerTime: date });
                  }}
                />
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Remind when this task is due
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <View style={styles.triggerHeader}>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
            Location reminder
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
            thumbColor={values.locationEnabled ? colors.primary : colors.surface}
          />
        </View>
        {values.locationEnabled ? (
          <LocationPicker
            latitude={values.latitude}
            longitude={values.longitude}
            radiusMeters={values.radiusMeters}
            locationName={values.locationName}
            onLocationChange={(latitude, longitude) =>
              update({ latitude, longitude })
            }
            onLocationNameChange={(locationName) => update({ locationName })}
            onRadiusChange={(radiusMeters) => update({ radiusMeters })}
          />
        ) : (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Remind when you arrive nearby
          </Text>
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
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        />
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.button,
            styles.cancelButton,
            { borderColor: colors.border, backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.button,
            styles.saveButton,
            shadow.sm,
            { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
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
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  notesInput: {
    minHeight: 120,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    lineHeight: 22,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: layout.controlHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerText: {
    ...typography.body,
    flex: 1,
  },
  iosDatePicker: {
    height: 216,
  },
  triggerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.minTouchTarget,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  button: {
    flex: 1,
    minHeight: layout.buttonHeight,
    justifyContent: "center",
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    ...typography.label,
    fontWeight: "600",
  },
});
