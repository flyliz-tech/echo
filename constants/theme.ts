import { Platform, type TextStyle, type ViewStyle } from "react-native";

export const fontFamily = {
  inter: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemiBold: "Inter_600SemiBold",
  interBold: "Inter_700Bold",
};

export const colors = {
  light: {
    background: "#F7F8FC",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceContainer: "#EFECFF",
    surfaceContainerLow: "#F5F2FF",
    surfaceContainerHigh: "#E8E5FF",
    text: "#1A1A2E",
    textSecondary: "#6B7280",
    textVariant: "#464555",
    border: "#E5E7EB",
    outline: "#777587",
    outlineVariant: "#C7C4D8",
    primary: "#4F46E5",
    primaryDeep: "#3525CD",
    primaryMuted: "#EEF2FF",
    primaryContainer: "#4F46E5",
    onPrimary: "#FFFFFF",
    time: "#F59E0B",
    timeContainer: "#FEA619",
    timeMuted: "rgba(254, 166, 25, 0.12)",
    location: "#14B8A6",
    locationContainer: "#006D62",
    locationMuted: "rgba(0, 109, 98, 0.12)",
    danger: "#BA1A1A",
    dangerMuted: "#FFEDEA",
    success: "#16A34A",
    successMuted: "#DCFCE7",
    tabInactive: "#9CA3AF",
    shadow: "rgba(26, 26, 46, 0.05)",
    shadowStrong: "rgba(26, 26, 46, 0.08)",
    fabGlow: "rgba(79, 70, 229, 0.3)",
    undo: "#F59E0B",
    toastSurface: "#1A1A2E",
    onToast: "#F3F4F6",
    priority: {
      low: "#9CA3AF",
      medium: "#4F46E5",
      high: "#F59E0B",
      urgent: "#DC2626",
    },
  },
  dark: {
    background: "#000000",
    surface: "#1C1C1E",
    surfaceElevated: "#2A2A2C",
    surfaceContainer: "#1C1C1E",
    surfaceContainerLow: "#1C1C1E",
    surfaceContainerHigh: "#2A2A2C",
    text: "#F3F4F6",
    textSecondary: "#9CA3AF",
    textVariant: "#9CA3AF",
    border: "#3A3A3C",
    outline: "#9CA3AF",
    outlineVariant: "#3A3A3C",
    primary: "#6366F1",
    primaryDeep: "#4F46E5",
    primaryMuted: "rgba(99, 102, 241, 0.2)",
    primaryContainer: "#4F46E5",
    onPrimary: "#FFFFFF",
    time: "#FBBF24",
    timeContainer: "#FBBF24",
    timeMuted: "rgba(251, 191, 36, 0.15)",
    location: "#2DD4BF",
    locationContainer: "#2DD4BF",
    locationMuted: "rgba(45, 212, 191, 0.15)",
    danger: "#EF4444",
    dangerMuted: "rgba(239, 68, 68, 0.15)",
    success: "#22C55E",
    successMuted: "rgba(34, 197, 94, 0.15)",
    tabInactive: "#6B7280",
    shadow: "rgba(0, 0, 0, 0.4)",
    shadowStrong: "rgba(0, 0, 0, 0.5)",
    fabGlow: "rgba(99, 102, 241, 0.4)",
    undo: "#FBBF24",
    toastSurface: "#1C1C1E",
    onToast: "#F3F4F6",
    priority: {
      low: "#6B7280",
      medium: "#6366F1",
      high: "#FBBF24",
      urgent: "#EF4444",
    },
  },
};

export type ThemeColors = (typeof colors)["light"];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: "700" as const,
    lineHeight: 41,
    letterSpacing: -0.68,
    fontFamily: fontFamily.interBold,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 28,
    fontFamily: fontFamily.interBold,
  },
  headlineLg: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 30,
    letterSpacing: -0.24,
    fontFamily: fontFamily.interBold,
  },
  headlineMd: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
    fontFamily: fontFamily.interSemiBold,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
    fontFamily: fontFamily.interSemiBold,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    fontFamily: fontFamily.inter,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    fontFamily: fontFamily.inter,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
    fontFamily: fontFamily.inter,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    fontFamily: fontFamily.interMedium,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 0.6,
    fontFamily: fontFamily.interSemiBold,
  },
};

export const layout = {
  inputHeight: 52,
  buttonHeight: 52,
  controlHeight: 48,
  minTouchTarget: 44,
  fabSize: 56,
  tabBarHeight: 56,
};

function elevation(
  y: number,
  blur: number,
  opacity: number,
  androidElevation: number
): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: "#1A1A2E",
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation: androidElevation },
    default: {},
  }) as ViewStyle;
}

export const elevationStyles = {
  level0: {} as ViewStyle,
  level1: elevation(2, 8, 0.05, 2),
  level2: elevation(10, 20, 0.08, 6),
  level3: Platform.select({
    ios: {
      shadowColor: "#4F46E5",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    default: {},
  }) as ViewStyle,
};

export const shadow: { sm: ViewStyle; md: ViewStyle } = {
  sm: elevationStyles.level1,
  md: elevationStyles.level2,
};

export function withFont(style: TextStyle): TextStyle {
  return style;
}
