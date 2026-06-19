import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar as RNStatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import "@/lib/services/geofencing";
import { DeleteUndoToast } from "@/components/DeleteUndoToast";
import { useTheme } from "@/hooks/useTheme";
import { openTask } from "@/lib/navigation/taskRouting";
import { setupNotificationResponseHandler } from "@/lib/services/notifications";
import { useTaskStore } from "@/lib/store/taskStore";

const LIGHT_STATUS_BAR_BG = "#000000";

function RootLayoutContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const initialize = useTaskStore((s) => s.initialize);
  const isInitialized = useTaskStore((s) => s.isInitialized);
  const isLoading = useTaskStore((s) => s.isLoading);
  const pendingDelete = useTaskStore((s) => s.pendingDelete);
  const undoDelete = useTaskStore((s) => s.undoDelete);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    RNStatusBar.setBarStyle("light-content");
    RNStatusBar.setBackgroundColor(LIGHT_STATUS_BAR_BG);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    return setupNotificationResponseHandler((taskId) => {
      openTask(router, taskId);
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      {insets.top > 0 && (
        <View
          style={{
            height: insets.top,
            backgroundColor: LIGHT_STATUS_BAR_BG,
          }}
        />
      )}
      <View style={{ flex: 1 }}>
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
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootLayoutContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
