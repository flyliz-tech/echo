import { useRouter } from "expo-router";

import { TaskForm } from "@/components/TaskForm";
import { requestNotificationPermissions } from "@/lib/services/notifications";
import { useTaskStore } from "@/lib/store/taskStore";

export default function CreateTaskScreen() {
  const router = useRouter();
  const createTask = useTaskStore((s) => s.createTask);

  return (
    <TaskForm
      submitLabel="Save"
      onCancel={() => router.replace("/(tabs)")}
      onSubmit={async (input) => {
        await requestNotificationPermissions();
        await createTask(input);
        router.replace("/(tabs)");
      }}
    />
  );
}
