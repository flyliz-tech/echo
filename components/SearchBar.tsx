import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Pressable, TextInput, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { layout, radius, spacing, typography } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  active?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search by task, location, notes",
  active = false,
  autoFocus,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.searchBar,
        {
          backgroundColor: colors.surface,
          borderColor: active ? colors.primary : colors.border,
          borderWidth: active ? 1.5 : 1,
        },
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={active ? colors.primary : colors.textSecondary}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.searchInput, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    height: layout.inputHeight,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
});
