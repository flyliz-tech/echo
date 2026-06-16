import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { TaskForm, TaskFormValues } from "@/components/TaskForm";
import { useTheme } from "@/hooks/useTheme";
import { Task, hasLocationTrigger, hasTimeTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    notes: task.notes ?? "",
    timeEnabled: hasTimeTrigger(task),
    locationEnabled: hasLocationTrigger(task),
    triggerTime: task.triggerTime ? new Date(task.triggerTime) : null,
    latitude: task.latitude,
    longitude: task.longitude,
    locationName: task.locationName ?? "",
    radiusMeters: task.radiusMeters,
  };
}

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const task = useTaskStore((s) => s.getTaskById(id));
  const updateTask = useTaskStore((s) => s.updateTask);

  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.textSecondary }}>Task not found</Text>
      </View>
    );
  }

  if (task.isCompleted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.textSecondary }}>
          Completed tasks can&apos;t be edited
        </Text>
      </View>
    );
  }

  return (
    <TaskForm
      initialValues={taskToFormValues(task)}
      submitLabel="Save"
      onCancel={() => router.back()}
      onSubmit={async (input) => {
        await updateTask(id, input);
        router.replace("/(tabs)");
      }}
    />
  );
}
