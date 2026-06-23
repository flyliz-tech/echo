import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EchoCard } from "@/components/ui/EchoCard";
import { useTheme } from "@/hooks/useTheme";
import { radius, spacing, typography } from "@/constants/theme";
import {
  ThemePreference,
  useThemeStore,
} from "@/lib/store/themeStore";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "phone-portrait-outline" },
];

const COMING_SOON = [
  { label: "Account & Sync", icon: "person-outline" as const },
  { label: "Notifications", icon: "notifications-outline" as const },
  { label: "About", icon: "information-circle-outline" as const },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <EchoCard style={styles.card} elevated>
          {THEME_OPTIONS.map((option, index) => {
            const active = preference === option.value;
            const isLast = index === THEME_OPTIONS.length - 1;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                style={[
                  styles.row,
                  !isLast && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                </View>
                {active && (
                  <Ionicons name="checkmark" size={22} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </EchoCard>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            GENERAL
          </Text>
          <View
            style={[
              styles.comingSoonBadge,
              { backgroundColor: colors.primaryMuted },
            ]}
          >
            <Text style={[styles.comingSoonText, { color: colors.primary }]}>
              Coming soon
            </Text>
          </View>
        </View>
        <EchoCard style={styles.card} elevated>
          {COMING_SOON.map((item, index) => {
            const isLast = index === COMING_SOON.length - 1;
            return (
              <View
                key={item.label}
                style={[
                  styles.row,
                  !isLast && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={colors.tabInactive}
                  />
                  <Text
                    style={[styles.rowLabel, { color: colors.tabInactive }]}
                  >
                    {item.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.tabInactive}
                />
              </View>
            );
          })}
        </EchoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.labelSm,
    letterSpacing: 1,
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  comingSoonText: {
    ...typography.labelSm,
    fontSize: 11,
    letterSpacing: 0,
  },
  card: { padding: 0, marginBottom: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rowLabel: { ...typography.body },
});
