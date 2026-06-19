import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchBar } from "@/components/SearchBar";
import { TaskCard } from "@/components/TaskCard";
import { useTheme } from "@/hooks/useTheme";
import { useVisibleTasks } from "@/hooks/useVisibleTasks";
import { spacing, typography } from "@/constants/theme";
import { useTaskStore } from "@/lib/store/taskStore";

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [localQuery, setLocalQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const handleSearch = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
  };

  const tasks = useVisibleTasks();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScreenHeader title="Search" />

      <SearchBar
        value={localQuery}
        onChangeText={handleSearch}
        active={focused || localQuery.length > 0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={48}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {localQuery ? "No matching tasks" : "Start typing to search"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/task/${item.id}`)}
            onToggleComplete={() => toggleComplete(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
  },
});
