import { Stack, useRouter, useSegments, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StatusBar as RNStatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import "@/lib/services/geofencing";
import { DeleteUndoToast } from "@/components/DeleteUndoToast";
import { useTheme } from "@/hooks/useTheme";
import { setupNotificationResponseHandler } from "@/lib/services/notifications";
import { useTaskStore } from "@/lib/store/taskStore";
import { ONBOARDING_KEY } from "@/lib/constants/onboarding";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { colors, isDark } = useTheme();
  const initialize = useTaskStore((s) => s.initialize);
  const isInitialized = useTaskStore((s) => s.isInitialized);
  const isLoading = useTaskStore((s) => s.isLoading);
  const pendingDelete = useTaskStore((s) => s.pendingDelete);
  const undoDelete = useTaskStore((s) => s.undoDelete);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS !== "android") return;
    RNStatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    RNStatusBar.setBackgroundColor(colors.background);
  }, [colors.background, isDark]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    return setupNotificationResponseHandler((taskId) => {
      router.push(`/task/${taskId}`);
    });
  }, [router]);

  useEffect(() => {
    if (!fontsLoaded || !isInitialized) return;
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setOnboardingChecked(true);
      const onOnboarding = segments.join("/").includes("onboarding");
      if (!value && !onOnboarding) {
        router.replace("/onboarding" as Href);
      }
      SplashScreen.hideAsync().catch(() => {});
    });
  }, [fontsLoaded, isInitialized, router, segments]);

  if (!fontsLoaded || (!isInitialized && isLoading) || !onboardingChecked) {
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
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
