import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { TaskForm } from "@/components/TaskForm";
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/constants/theme";
import { requestNotificationPermissions } from "@/lib/services/notifications";
import { deriveTriggerType, hasTimeTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export default function CreateTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const createTask = useTaskStore((s) => s.createTask);
  const [formKey, setFormKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFormKey((k) => k + 1);
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View style={styles.headerPad}>
        <ScreenHeader title="Create Task" />
      </View>

      <TaskForm
        key={formKey}
        submitLabel="Save"
        onCancel={() => router.replace("/(tabs)")}
        onSubmit={async (input) => {
          const triggerType = input.triggerType ?? deriveTriggerType(input);
          if (hasTimeTrigger({ triggerType })) {
            await requestNotificationPermissions();
          }
          await createTask(input);
          router.replace("/(tabs)");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPad: {
    paddingHorizontal: spacing.md,
  },
});
