export const colors = {
  light: {
    background: "#F8F9FA",
    surface: "#FFFFFF",
    text: "#1A1A2E",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    primary: "#2563EB",
    primaryMuted: "#DBEAFE",
    danger: "#DC2626",
    dangerMuted: "#FEE2E2",
    success: "#16A34A",
    tabInactive: "#9CA3AF",
    shadow: "rgba(0,0,0,0.08)",
  },
  dark: {
    background: "#0F0F14",
    surface: "#1A1A24",
    text: "#F3F4F6",
    textSecondary: "#9CA3AF",
    border: "#2D2D3A",
    primary: "#3B82F6",
    primaryMuted: "#1E3A5F",
    danger: "#EF4444",
    dangerMuted: "#450A0A",
    success: "#22C55E",
    tabInactive: "#6B7280",
    shadow: "rgba(0,0,0,0.3)",
  },
};

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
  full: 999,
};

export const typography = {
  title: { fontSize: 22, fontWeight: "700" as const },
  heading: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
  label: { fontSize: 14, fontWeight: "500" as const },
};
