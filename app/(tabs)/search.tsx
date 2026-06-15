import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TaskCard } from "@/components/TaskCard";
import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";
import { useTaskStore } from "@/lib/store/taskStore";

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [localQuery, setLocalQuery] = useState("");
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const getFilteredTasks = useTaskStore((s) => s.getFilteredTasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const handleSearch = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
  };

  const tasks = getFilteredTasks();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.primary },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.primary} />
        <TextInput
          value={localQuery}
          onChangeText={handleSearch}
          placeholder="Search by task, location, notes"
          placeholderTextColor={colors.textSecondary}
          autoFocus
          style={[styles.searchInput, { color: colors.text }]}
        />
        {localQuery.length > 0 && (
          <Pressable
            onPress={() => {
              setLocalQuery("");
              setSearchQuery("");
            }}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    paddingVertical: 0,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  empty: {
    paddingTop: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
  },
});
