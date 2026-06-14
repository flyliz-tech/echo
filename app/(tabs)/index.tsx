import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TaskCard } from "@/components/TaskCard";
import { TaskSortToggle } from "@/components/TaskSortToggle";
import { useTheme } from "@/hooks/useTheme";
import { spacing, typography } from "@/constants/theme";
import { useTaskStore } from "@/lib/store/taskStore";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const sortMode = useTaskStore((s) => s.sortMode);
  const setSortMode = useTaskStore((s) => s.setSortMode);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const getFilteredTasks = useTaskStore((s) => s.getFilteredTasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const tasks = getFilteredTasks();
  const isSearching = searchFocused || searchQuery.length > 0;

  useEffect(() => {
    navigation.setOptions({ headerShown: !searchFocused });
  }, [navigation, searchFocused]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: isSearching ? colors.primary : colors.border,
            borderWidth: isSearching ? 2 : 1,
            paddingVertical: isSearching ? spacing.md : spacing.sm,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={isSearching ? 20 : 18}
          color={isSearching ? colors.primary : colors.textSecondary}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search by task, location, notes"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {!isSearching && (
        <>
          <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>
            Sort task
          </Text>
          <TaskSortToggle value={sortMode} onChange={setSortMode} />
        </>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? "No matching tasks" : "No tasks yet. Tap + to create one."}
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
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
  },
  sortLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
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
    textAlign: "center",
  },
});
