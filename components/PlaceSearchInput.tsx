import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { layout, radius, shadow, spacing, typography } from "@/constants/theme";
import { GeocodeResult, searchPlaces } from "@/lib/services/geocoding";

interface PlaceSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace: (place: GeocodeResult) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 350;

export function PlaceSearchInput({
  value,
  onChangeText,
  onSelectPlace,
  placeholder = "Search for a place",
}: PlaceSearchInputProps) {
  const { colors } = useTheme();
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const queryRef = useRef("");
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const query = value.trim();
    queryRef.current = query;

    if (query.length < 3) {
      setResults([]);
      setIsLoading(false);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    const handle = setTimeout(async () => {
      const places = await searchPlaces(query);
      if (queryRef.current !== query) return;
      setResults(places);
      setShowResults(true);
      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [value]);

  const handleSelect = (place: GeocodeResult) => {
    justSelectedRef.current = true;
    setResults([]);
    setShowResults(false);
    setIsLoading(false);
    onSelectPlace(place);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text }]}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : value.length > 0 ? (
          <Pressable
            onPress={() => {
              onChangeText("");
              setResults([]);
              setShowResults(false);
            }}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {showResults && results.length > 0 && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <FlatList
            data={results}
            keyExtractor={(item, index) =>
              `${item.latitude},${item.longitude},${index}`
            }
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.resultRow,
                  { borderBottomColor: colors.border },
                  pressed && { backgroundColor: colors.primaryMuted },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.resultText, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: layout.controlHeight,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  dropdown: {
    position: "absolute",
    top: layout.controlHeight + spacing.xs,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: radius.md,
    maxHeight: 240,
    overflow: "hidden",
    zIndex: 20,
    ...shadow.md,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultText: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
  },
});
