import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";

interface EchoCheckboxProps {
  checked: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
}

export function EchoCheckbox({
  checked,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
}: EchoCheckboxProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.15, { damping: 8 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  const isChecked = selectionMode ? selected : checked;
  const iconName = selectionMode
    ? selected
      ? "checkmark-circle"
      : "ellipse-outline"
    : checked
      ? "checkmark-circle"
      : "ellipse-outline";

  const iconColor = selectionMode
    ? selected
      ? colors.primary
      : colors.outlineVariant
    : checked
      ? colors.success
      : colors.outlineVariant;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={300}
      hitSlop={12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
    >
      <Animated.View style={[styles.box, animatedStyle]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    paddingTop: 2,
  },
});
