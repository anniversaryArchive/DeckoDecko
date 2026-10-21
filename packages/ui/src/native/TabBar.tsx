import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { border, radius, space, type ThemeColors } from "../tokens";
import { PRESSED_OPACITY } from "./pressable";
import { Text } from "./Text";

/** 알약(선택 표시) 높이. pill · icon 모양 */
const PILL_HEIGHT = 40;
/** 아이콘 아래 이름이 붙는 모양(labeled)에서 선택 표시 면의 가장 작은 폭 (이름이 짧아도 아이콘만큼은 넓게) */
const LABELED_MIN_WIDTH = 88;
/** 아이콘만 있는 탭의 폭 */
const ICON_TAB_WIDTH = 44;
/** icon 모양에서 선택된 탭 알약의 폭 */
const ICON_PILL_WIDTH = 56;
/** 아이콘 크기. pill 모양의 선택된 탭은 이름이 옆에 붙어 조금 작게 */
const SELECTED_ICON_SIZE = 20;
const ICON_SIZE = 22;

/**
 * 이름을 보이는 방식.
 * pill: 선택된 탭만 알약 안에 아이콘 + 이름 (시안)
 * labeled: 모든 탭의 아이콘 아래에 이름. 선택된 탭은 아이콘과 이름을 함께 덮는 면
 * icon: 아이콘만. 선택된 탭은 아이콘 뒤에 알약
 * 어느 모양이든 이름은 화면 읽기 프로그램이 읽는다.
 */
export type TabBarVariant = "pill" | "labeled" | "icon";

export type TabBarItem = {
  key: string;
  /** 탭 이름. 모양(variant)에 따라 보이거나 숨지만, 화면 읽기 프로그램은 늘 읽는다 */
  label: string;
  /** 아이콘. 탭 바가 고른 색 · 크기로 그린다 (아이콘 라이브러리는 앱에서) */
  renderIcon: (props: { color: string; size: number; selected: boolean }) => ReactNode;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export type TabBarProps = {
  items: TabBarItem[];
  /** 생략하면 pill */
  variant?: TabBarVariant;
  /** 배치용 (바깥 여백, safe area) */
  style?: StyleProp<ViewStyle>;
};

/**
 * 떠 있는 알약형 하단 탭 바. 이름을 보이는 방식은 variant 로 고른다.
 * 탭마다 같은 폭의 칸을 주고 그 가운데에 둔다. 선택된 탭이 넓어져도 다른 탭의 아이콘은 움직이지 않는다.
 * 그리기만 한다: 내비게이션 연결 · safe area · 키보드가 뜰 때 숨기기는 앱의 탭 레이아웃(Tabs 의 tabBar)이 맡는다.
 */
export function TabBar({ items, variant = "pill", style }: TabBarProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: space[8],
          paddingHorizontal: space[12],
          borderRadius: radius.sheet,
          borderWidth: border.default,
          borderColor: colors.line,
          backgroundColor: colors.surface,
        },
        style,
      ]}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          onLongPress={item.onLongPress}
          accessibilityRole="tab"
          accessibilityState={{ selected: item.selected }}
          accessibilityLabel={item.label}
          hitSlop={{ top: space[4], bottom: space[4] }}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: "center",
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <Tab item={item} variant={variant} />
        </Pressable>
      ))}
    </View>
  );
}

function Tab({ item, variant }: { item: TabBarItem; variant: TabBarVariant }) {
  const { colors } = useTheme();
  const role: keyof ThemeColors = item.selected ? "accent" : "textMuted";
  // 선택되지 않은 탭도 바 바탕색을 칠해 둔다. 면이 없다가 생기면 Android 가 둥근 모서리를 빠뜨리고 네모로 그린다
  const pill = item.selected ? colors.accentSoft : colors.surface;

  if (variant === "labeled") {
    return (
      <View
        style={{
          alignItems: "center",
          gap: space[2],
          minWidth: LABELED_MIN_WIDTH,
          maxWidth: "100%",
          paddingVertical: space[6],
          paddingHorizontal: space[20],
          // 가로를 넓게 잡고 끝까지 둥글게 해 캡슐(타원에 가까운) 모양으로
          borderRadius: radius.full,
          backgroundColor: pill,
        }}
      >
        {item.renderIcon({ color: colors[role], size: ICON_SIZE, selected: item.selected })}
        <Text
          variant="caption"
          weight={item.selected ? "bold" : "medium"}
          color={role}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </View>
    );
  }

  if (variant === "icon" || !item.selected) {
    return (
      <View
        style={{
          width: item.selected ? ICON_PILL_WIDTH : ICON_TAB_WIDTH,
          height: PILL_HEIGHT,
          borderRadius: radius.full,
          backgroundColor: pill,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.renderIcon({ color: colors[role], size: ICON_SIZE, selected: item.selected })}
      </View>
    );
  }

  // pill 모양의 선택된 탭: 알약 안에 아이콘 + 이름
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[6],
        // 글자를 크게 키워도 칸을 넘지 않고 이름이 줄어든다
        maxWidth: "100%",
        height: PILL_HEIGHT,
        paddingHorizontal: space[16],
        borderRadius: radius.full,
        backgroundColor: pill,
      }}
    >
      {item.renderIcon({ color: colors[role], size: SELECTED_ICON_SIZE, selected: true })}
      <Text
        variant="caption"
        weight="bold"
        color={role}
        numberOfLines={1}
        style={{ flexShrink: 1 }}
      >
        {item.label}
      </Text>
    </View>
  );
}
