import { Stack } from "expo-router";

import { useTheme } from "@/hooks/useTheme";

export default function TaskDetailLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "View" }} />
      <Stack.Screen name="edit" options={{ title: "Edit" }} />
    </Stack>
  );
}
