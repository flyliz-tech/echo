import { useColorScheme } from "react-native";

import { colors } from "@/constants/theme";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return {
    isDark,
    colors: isDark ? colors.dark : colors.light,
  };
}
