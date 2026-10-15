import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { border, radius } from "../tokens";

export type CardProps = {
  children: ReactNode;
  /**
   * default: 흰 면 + 테두리 (가챠 카드, 목록 묶음)
   * highlight: 강조 면 (홈 소장률 카드)
   */
  variant?: "default" | "highlight";
  /** 넘기면 눌리는 카드가 된다 */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** 안쪽 여백 · 배치는 카드마다 달라서 여기로 넘긴다 */
  style?: StyleProp<ViewStyle>;
};

/** 테두리와 모서리만 정한 면. 안쪽 여백은 쓰는 곳에서 정한다 (시안의 카드마다 다르다). */
export function Card({
  children,
  variant = "default",
  onPress,
  accessibilityLabel,
  style,
}: CardProps) {
  const { colors } = useTheme();
  const base: ViewStyle =
    variant === "highlight"
      ? {
          backgroundColor: colors.highlightSurface,
          borderColor: colors.highlightLine,
          borderRadius: radius.banner,
        }
      : { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.card };
  const shape: ViewStyle = { ...base, borderWidth: border.default, overflow: "hidden" };

  if (!onPress) {
    return <View style={[shape, style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [shape, { opacity: pressed ? 0.85 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
