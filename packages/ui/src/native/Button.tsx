import type { ReactNode } from "react";
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { border, radius, space, type ThemeColors, type TypographyName } from "../tokens";
import { Text } from "./Text";

/** 버튼 높이. 시안의 54(시트 · 화면 하단) · 44(카드 안, 빈 화면) · 36(작은 동작) */
const HEIGHT = { lg: 54, md: 44, sm: 36 } as const;
const PADDING = { lg: space[24], md: space[18], sm: space[14] } as const;
const TEXT: Record<ButtonSize, TypographyName> = { lg: "titleSm", md: "label", sm: "caption" };

export type ButtonVariant = "primary" | "secondary" | "outline" | "soft" | "danger";
export type ButtonSize = keyof typeof HEIGHT;

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  /** 버튼 글자 */
  children: string;
  /**
   * primary: 주요 동작 (추가하기, 보내기)
   * secondary: 흰 면 + 테두리 (취소)
   * outline: 흰 면 + 포인트 테두리 (새 요청 · 문의)
   * soft: 연한 포인트 면 (등록 요청하기)
   * danger: 되돌릴 수 없는 동작 (폴더 삭제)
   */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 글자 왼쪽 아이콘 */
  icon?: ReactNode;
  /** 가로를 꽉 채운다. 생략하면 글자 길이만큼 */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

function variantColors(variant: ButtonVariant, colors: ThemeColors) {
  switch (variant) {
    case "primary":
      return { bg: colors.primary, line: colors.primary, text: "onPrimary" } as const;
    case "secondary":
      return { bg: colors.surface, line: colors.line, text: "text" } as const;
    case "outline":
      return { bg: colors.surface, line: colors.primary, text: "accent" } as const;
    case "soft":
      return { bg: colors.accentSoft, line: colors.accentSoft, text: "accent" } as const;
    case "danger":
      return { bg: colors.accent, line: colors.accent, text: "onAccent" } as const;
  }
}

export function Button({
  children,
  variant = "primary",
  size = "lg",
  icon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const c = variantColors(variant, colors);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        {
          height: HEIGHT[size],
          paddingHorizontal: PADDING[size],
          borderRadius: radius.full,
          borderWidth: border.default,
          borderColor: c.line,
          backgroundColor: c.bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: space[8],
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon ? <View>{icon}</View> : null}
      <Text variant={TEXT[size]} weight="bold" color={c.text} numberOfLines={1}>
        {children}
      </Text>
    </Pressable>
  );
}
