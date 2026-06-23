import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Pressable, TextInput, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { elevationStyles, layout, radius, spacing, typography } from "@/constants/theme";

interface EchoSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  active?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function EchoSearchBar({
  value,
  onChangeText,
  placeholder = "Search tasks or locations...",
  active = false,
  autoFocus,
  onFocus,
  onBlur,
}: EchoSearchBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: colors.surface },
        elevationStyles.level1,
        active && { borderWidth: 1.5, borderColor: colors.primary },
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={active ? colors.primary : colors.outline}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        style={[styles.searchInput, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.outline} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.full,
    height: layout.inputHeight,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    paddingVertical: 0,
  },
});
