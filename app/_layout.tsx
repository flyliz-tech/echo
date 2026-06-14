import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "@/lib/services/geofencing";
import { DeleteUndoToast } from "@/components/DeleteUndoToast";
import { useTheme } from "@/hooks/useTheme";
import { setupNotificationResponseHandler } from "@/lib/services/notifications";
import { useTaskStore } from "@/lib/store/taskStore";

export default function RootLayout() {
  const router = useRouter();
  const { colors } = useTheme();
  const initialize = useTaskStore((s) => s.initialize);
  const isInitialized = useTaskStore((s) => s.isInitialized);
  const isLoading = useTaskStore((s) => s.isLoading);
  const pendingDelete = useTaskStore((s) => s.pendingDelete);
  const undoDelete = useTaskStore((s) => s.undoDelete);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    return setupNotificationResponseHandler((taskId) => {
      router.push(`/task/${taskId}`);
    });
  }, [router]);

  if (!isInitialized && isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings"
            options={{ title: "Settings", headerBackTitle: "Back" }}
          />
          <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
        </Stack>

        {pendingDelete && (
          <DeleteUndoToast
            taskTitle={pendingDelete.task.title}
            onUndo={undoDelete}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
