import { addDays, format, isSameDay, isToday } from "date-fns";
import { useMemo, useRef } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { radius, shadow, spacing } from "@/constants/theme";

const PAST_DAYS = 365;
const FUTURE_DAYS = 365;
const ITEM_WIDTH = 64;
const STRIP_HEIGHT = 62;
const PILL_WIDTH = 58;
const PILL_HEIGHT = 60;
const SCREEN_WIDTH = Dimensions.get("window").width;
// Padding so the first/last day can sit under the centered pill.
const SIDE_PAD = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

interface DateSliderProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  /** Set of `yyyy-MM-dd` keys that have tasks, shown with a dot. */
  markedDays?: Set<string>;
  /** Horizontal padding of the parent screen, cancelled so the strip is full-bleed. */
  bleed?: number;
}

interface DayCardProps {
  day: Date;
  index: number;
  scrollX: SharedValue<number>;
  selected: boolean;
  today: boolean;
  marked: boolean;
  onPress: () => void;
}

/**
 * One day on the wheel. Its opacity and scale ease with distance from the
 * centred pill (computed live from the scroll offset on the UI thread), giving
 * the rolling depth of a native time picker.
 */
function DayCard({
  day,
  index,
  scrollX,
  selected,
  today,
  marked,
  onPress,
}: DayCardProps) {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(index - scrollX.value / ITEM_WIDTH);
    return {
      opacity: interpolate(
        distance,
        [0, 1, 2, 3],
        [1, 0.45, 0.24, 0.14],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(
            distance,
            [0, 1, 2],
            [1, 0.82, 0.7],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.itemInner, animatedStyle]}>
        <Text
          style={[
            styles.weekday,
            { color: selected ? colors.text : colors.textSecondary },
          ]}
        >
          {today ? "Today" : format(day, "EEE")}
        </Text>
        <Text
          style={[
            styles.dayNum,
            { color: selected ? colors.primary : colors.text },
          ]}
        >
          {format(day, "dd")}
        </Text>
        <Text
          style={[
            styles.month,
            { color: selected ? colors.text : colors.textSecondary },
          ]}
        >
          {format(day, "MMM")}
        </Text>
        <View
          style={[
            styles.dot,
            marked && {
              backgroundColor: selected ? colors.primary : colors.textSecondary,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * Full-width, snap-to-center day wheel. A fixed pill highlights the centred
 * day; swiping rolls days through it (fading/shrinking with distance) and
 * selects whichever lands in the middle. Tapping a day rolls it to the centre.
 */
export function DateSlider({
  selectedDate,
  onSelect,
  markedDays,
  bleed = spacing.md,
}: DateSliderProps) {
  const { colors } = useTheme();
  const listRef = useRef<FlatList<Date>>(null);

  const days = useMemo(() => {
    const start = addDays(new Date(), -PAST_DAYS);
    return Array.from({ length: PAST_DAYS + 1 + FUTURE_DAYS }, (_, i) =>
      addDays(start, i)
    );
  }, []);

  const selectedIndex = useMemo(
    () => days.findIndex((d) => isSameDay(d, selectedDate)),
    [days, selectedDate]
  );

  // Seed at the initial scroll position so depth is correct before first scroll.
  const scrollX = useSharedValue(
    (selectedIndex >= 0 ? selectedIndex : 0) * ITEM_WIDTH
  );

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const selectIndex = (index: number, animated: boolean) => {
    const day = days[index];
    if (!day) return;
    listRef.current?.scrollToOffset({ offset: index * ITEM_WIDTH, animated });
    if (!isSameDay(day, selectedDate)) onSelect(day);
  };

  // After a swipe settles, select whichever day landed under the pill.
  const handleSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
    const clamped = Math.max(0, Math.min(index, days.length - 1));
    const day = days[clamped];
    if (day && !isSameDay(day, selectedDate)) onSelect(day);
  };

  return (
    <View style={[styles.strip, { marginHorizontal: -bleed }]}>
      {/* Fixed centered highlight pill. */}
      <View
        pointerEvents="none"
        style={[
          styles.pill,
          shadow.sm,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      />

      <Animated.FlatList
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={days}
        keyExtractor={(d: Date) => d.toISOString()}
        contentContainerStyle={styles.content}
        getItemLayout={(_data: unknown, index: number) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        initialScrollIndex={selectedIndex >= 0 ? selectedIndex : 0}
        onScrollToIndexFailed={({ index }: { index: number }) => {
          listRef.current?.scrollToOffset({
            offset: ITEM_WIDTH * index,
            animated: false,
          });
        }}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleSettle}
        renderItem={({ item, index }: ListRenderItemInfo<Date>) => (
          <DayCard
            day={item}
            index={index}
            scrollX={scrollX}
            selected={isSameDay(item, selectedDate)}
            today={isToday(item)}
            marked={markedDays?.has(format(item, "yyyy-MM-dd")) ?? false}
            onPress={() => selectIndex(index, true)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: STRIP_HEIGHT,
    justifyContent: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    position: "absolute",
    left: (SCREEN_WIDTH - PILL_WIDTH) / 2,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: SIDE_PAD,
  },
  item: {
    width: ITEM_WIDTH,
    height: STRIP_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  weekday: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
  dayNum: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    marginVertical: 1,
  },
  month: {
    fontSize: 11,
    lineHeight: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    backgroundColor: "transparent",
  },
});
