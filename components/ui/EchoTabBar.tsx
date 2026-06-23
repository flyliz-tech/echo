import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";
import { elevationStyles, layout, radius, spacing } from "@/constants/theme";

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  search: "search",
  create: "add",
  map: "map",
  calendar: "calendar",
};

export function EchoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          borderTopColor: colors.border,
        },
        elevationStyles.level1,
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isCreate = route.name === "create";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = TAB_ICONS[route.name] ?? "ellipse";
        const iconColor = isFocused ? colors.primary : colors.tabInactive;

        if (isCreate) {
          return (
            <View key={route.key} style={styles.fabSlot}>
              <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                  styles.fabWrapper,
                  elevationStyles.level3,
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={[colors.primaryDeep, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.fab}
                >
                  <Ionicons name="add" size={28} color={colors.onPrimary} />
                </LinearGradient>
              </Pressable>
            </View>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[
              styles.tab,
              isFocused && {
                backgroundColor: colors.primaryMuted,
                borderRadius: radius.full,
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={iconColor}
              style={isFocused ? { fontWeight: "bold" } : undefined}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: layout.tabBarHeight,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    marginHorizontal: 2,
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
    marginTop: -28,
  },
  fabWrapper: {
    borderRadius: layout.fabSize / 2,
  },
  fab: {
    width: layout.fabSize,
    height: layout.fabSize,
    borderRadius: layout.fabSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
