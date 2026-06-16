import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { TaskForm } from "@/components/TaskForm";
import { requestNotificationPermissions } from "@/lib/services/notifications";
import { deriveTriggerType, hasTimeTrigger } from "@/lib/types/task";
import { useTaskStore } from "@/lib/store/taskStore";

export default function CreateTaskScreen() {
  const router = useRouter();
  const createTask = useTaskStore((s) => s.createTask);
  const [formKey, setFormKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFormKey((k) => k + 1);
    }, [])
  );

  return (
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
  );
}
