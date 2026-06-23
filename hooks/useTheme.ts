import { useColorScheme } from "react-native";

import { colors, type ThemeColors } from "@/constants/theme";
import { useThemeStore } from "@/lib/store/themeStore";

export function useTheme() {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  const isDark =
    preference === "dark" ||
    (preference === "system" && systemScheme === "dark");

  return {
    preference,
    isDark,
    colors: (isDark ? colors.dark : colors.light) as ThemeColors,
  };
}
