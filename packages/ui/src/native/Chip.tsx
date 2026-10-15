import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { border, radius, space } from "../tokens";
import { Text } from "./Text";

/** 칩 높이. 시안의 필터 칩(목록 · 검색) */
const HEIGHT = 34;

export type ChipProps = Omit<PressableProps, "children" | "style"> & {
  /** 칩 글자 */
  children: string;
  selected?: boolean;
  /**
   * 선택됐을 때 면.
   * primary: 필터 칩 (목록 "전체")
   * inverse: 폴더 칩 (내 굿즈 "전체")
   */
  selectedTone?: "primary" | "inverse";
  /** 글자 오른쪽 아이콘 (펼침 ▾, 지우기 ×) */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  children,
  selected = false,
  selectedTone = "primary",
  trailing,
  disabled,
  style,
  ...rest
}: ChipProps) {
  const { colors } = useTheme();
  const bg = selected ? colors[selectedTone] : colors.surface;
  const text = selected ? (selectedTone === "primary" ? "onPrimary" : "onInverse") : "text";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        {
          height: HEIGHT,
          paddingLeft: space[14],
          // 아이콘 상자 안 양옆에 2px 정도 빈 곳이 있어서 그만큼 줄인다. 눈으로 보면 양쪽 여백 14, 글자와 아이콘 사이 4
          paddingRight: trailing ? space[12] : space[14],
          borderRadius: radius.full,
          borderWidth: border.default,
          borderColor: selected ? bg : colors.line,
          backgroundColor: bg,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          gap: space[2],
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text variant="caption" weight={selected ? "bold" : "medium"} color={text} numberOfLines={1}>
        {children}
      </Text>
      {trailing}
    </Pressable>
  );
}
