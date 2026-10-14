import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useTheme } from "../theme";
import {
  fonts,
  typography,
  type FontWeightName,
  type ThemeColors,
  type TypographyName,
} from "../tokens";

export type TextProps = RNTextProps & {
  /** 글자 크기 단계. 생략하면 body */
  variant?: TypographyName;
  /** 굵기. 생략하면 variant 의 기본 굵기 */
  weight?: FontWeightName;
  /** 숫자 · 영문만 있는 곳(가격, 개수, 소장률)에서 Inter 로 쓴다 */
  numeric?: boolean;
  /** 색 역할. 생략하면 text */
  color?: keyof ThemeColors;
};

/**
 * 앱의 모든 글자는 이 Text 로 쓴다. 화면에서 fontFamily · fontSize 를 직접 적지 않는다.
 * RN 은 굵기마다 family 가 달라서 fontWeight 대신 weight 로 family 를 고른다.
 * style 로 fontWeight 를 넘기지 않는다 (Android 에서 커스텀 글꼴이 시스템 글꼴로 바뀐다).
 */
export function Text({
  variant = "body",
  weight,
  numeric = false,
  color = "text",
  style,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const t = typography[variant];
  const family = (numeric ? fonts.numeric : fonts.sans)[weight ?? t.weight];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: family,
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          color: colors[color],
        },
        style,
      ]}
    />
  );
}
