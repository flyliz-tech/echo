import { useRouter } from "expo-router";

import { TaskForm } from "@/components/TaskForm";
import { requestNotificationPermissions } from "@/lib/services/notifications";
import { deriveTriggerType, hasTimeTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export default function CreateTaskScreen() {
  const router = useRouter();
  const createTask = useTaskStore((s) => s.createTask);

  return (
    <TaskForm
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
  );
}
