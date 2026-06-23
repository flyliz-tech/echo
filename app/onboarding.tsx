import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useTheme } from "@/hooks/useTheme";
import { ONBOARDING_KEY } from "@/lib/constants/onboarding";
import { radius, spacing, typography } from "@/constants/theme";
import { requestLocationPermissions } from "@/lib/services/geofencing";
import { requestNotificationPermissions } from "@/lib/services/notifications";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "location" as const,
    title: "Reminders that find you",
    body: "Echo fires when you arrive at the places that matter.",
  },
  {
    icon: "time" as const,
    title: "Right time, right place",
    body: "Combine time and location triggers for smarter reminders.",
  },
  {
    icon: "cloud-offline-outline" as const,
    title: "Works offline",
    body: "No account needed. Your tasks stay on your device.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await requestLocationPermissions();
    await requestNotificationPermissions();
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const skip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable onPress={skip} style={styles.skip}>
        <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setPage(index);
        }}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[colors.primaryMuted, colors.background]}
              style={styles.iconCircle}
            >
              <Ionicons name={item.icon} size={48} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.slideTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.slideBody, { color: colors.textSecondary }]}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === page ? colors.primary : colors.outlineVariant,
              },
            ]}
          />
        ))}
      </View>

      {page === SLIDES.length - 1 ? (
        <View style={styles.footer}>
          <Text style={[styles.permissionNote, { color: colors.textSecondary }]}>
            Echo needs location (Always) and notifications to fire reminders in
            the background.
          </Text>
          <PrimaryButton label="Get started" onPress={finish} />
        </View>
      ) : (
        <Pressable
          onPress={() => {
            listRef.current?.scrollToIndex({ index: page + 1 });
            setPage(page + 1);
          }}
          style={styles.nextBtn}
        >
          <Text style={[styles.nextText, { color: colors.primary }]}>Next</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: {
    alignSelf: "flex-end",
    padding: spacing.md,
  },
  skipText: {
    ...typography.label,
    fontWeight: "600",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  slideTitle: {
    ...typography.headlineLg,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  slideBody: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  permissionNote: {
    ...typography.bodyMd,
    textAlign: "center",
  },
  nextBtn: {
    alignItems: "center",
    padding: spacing.lg,
  },
  nextText: {
    ...typography.label,
    fontWeight: "600",
  },
});
