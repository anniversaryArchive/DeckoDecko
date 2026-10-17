import { Children, type ReactNode } from "react";
import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

import { useTheme } from "../theme";
import {
  fonts,
  typography,
  type FontWeightName,
  type ThemeColors,
  type TypographyName,
} from "../tokens";

export type TextProps = Omit<RNTextProps, "style"> & {
  /** 글자 크기 단계. 생략하면 body */
  variant?: TypographyName;
  /** 굵기. 생략하면 variant 의 기본 굵기 */
  weight?: FontWeightName;
  /** 색 역할. 생략하면 text */
  color?: keyof ThemeColors;
  /** fontWeight · fontFamily 는 받지 않는다. 굵기는 weight 로, 글꼴은 Text 가 고른다 */
  style?: StyleProp<Omit<TextStyle, "fontWeight" | "fontFamily">>;
};

/** 큰 글자(display 계열)는 시스템 글자 크기를 키워도 1.5배까지만 커진다. 그 이상이면 화면 폭을 넘는다 */
const DISPLAY_MAX_FONT_SCALE = 1.5;

/** 글자마다 고르는 글꼴: 한국어 Noto Sans KR · 일본어 · 한자 Noto Sans JP · 나머지 Inter */
export type Script = "ko" | "ja" | "latin";

/**
 * 글자가 어느 글꼴로 그려질지.
 * - ko: 한글, 원문자(① ⑳ ⓐ), 괄호 · 원문자 한글(㈜), CJK 단위(㎝ ㎏). Noto Sans KR 에 있고 Inter 에는 없는 글자들
 * - ja: 히라가나 · 가타카나, 한자, 전각 문자 · CJK 문장부호(「」、。). Noto Sans KR 은 한자가 8천 자 정도뿐이라 Noto Sans JP 로 그린다
 *   (한국어 문장 속 한자도 Noto Sans JP 로 보인다. 모양 차이는 거의 없다)
 * - latin: 나머지 (영어 · 숫자 · 특수문자). ♪ ♀ 처럼 Inter 에 없는 기호는 휴대폰이 시스템 글꼴로 대신 그린다
 */
export function scriptOf(code: number): Script {
  if (
    (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
    (code >= 0x2460 && code <= 0x24ff) || // 원문자 · 괄호 숫자 (① ⑳ ⑴ ⓐ)
    (code >= 0x3130 && code <= 0x318f) || // 한글 호환 자모
    (code >= 0x3200 && code <= 0x33ff) || // 괄호 · 원문자 한글 · 한자(㈜), CJK 단위(㎝ ㎏ ㎡)
    (code >= 0xa960 && code <= 0xa97f) || // 한글 자모 확장 A (옛한글)
    (code >= 0xac00 && code <= 0xd7af) || // 한글 음절
    (code >= 0xd7b0 && code <= 0xd7ff) // 한글 자모 확장 B (옛한글)
  )
    return "ko";
  if (
    (code >= 0x3000 && code <= 0x30ff) || // CJK 기호 · 문장부호, 히라가나, 가타카나
    (code >= 0x3190 && code <= 0x31ff) || // 한문 훈점, CJK 획, 가타카나 확장
    (code >= 0x3400 && code <= 0x4dbf) || // 한자 확장 A
    (code >= 0x4e00 && code <= 0x9fff) || // 한자
    (code >= 0xf900 && code <= 0xfaff) || // 호환 한자
    (code >= 0xfe30 && code <= 0xfe4f) || // CJK 호환 형태 (세로쓰기 부호)
    (code >= 0xff00 && code <= 0xffef) // 전각 · 반각 문자
  )
    return "ja";
  return "latin";
}

type Run = { text: string; script: Script };

/**
 * 문자열을 글꼴이 같은 덩어리로 나눈다.
 * "마스코트 Vol.2 森の" → [마스코트 ] [Vol.2 ] [森の]
 * 띄어쓰기는 앞 덩어리에 붙인다 (덩어리가 잘게 쪼개지지 않게).
 */
export function splitByScript(text: string): Run[] {
  const runs: Run[] = [];
  for (const ch of text) {
    const last = runs[runs.length - 1];
    if (last && /\s/.test(ch)) {
      last.text += ch;
      continue;
    }
    const script = scriptOf(ch.codePointAt(0) ?? 0);
    if (last && last.script === script) last.text += ch;
    else runs.push({ text: ch, script });
  }
  return runs;
}

/**
 * 앱의 모든 글자는 이 Text 로 쓴다. 화면에서 fontFamily · fontSize 를 직접 적지 않는다.
 *
 * 글꼴은 글자를 보고 자동으로 고른다: 한글은 Noto Sans KR, 일본어 · 한자는 Noto Sans JP, 영어 · 숫자 · 특수문자는 Inter.
 * DB 에서 온 가챠 이름이나 번역 문장처럼 무엇이 섞였는지 모르는 글도 그대로 넘기면 된다.
 * RN 은 Text 하나에 글꼴 하나라서, 바깥은 Noto Sans KR 로 두고 다른 덩어리만 안쪽 Text 로 감싸 한 문단 안에서 글꼴을 바꾼다.
 *
 * RN 은 굵기마다 family 가 달라서 fontWeight 대신 weight 로 family 를 고른다.
 * style 로 fontWeight 를 넘기면 Android 에서 커스텀 글꼴이 시스템 글꼴로 바뀌어서, 타입에서 막아 두었다.
 *
 * iOS 는 한글을 글자 단위로 줄바꿈해 "40 / 0엔" 처럼 단어가 갈라지므로 띄어쓰기 단위(hangul-word)를 기본으로 한다.
 */
export function Text({
  variant = "body",
  weight,
  color = "text",
  style,
  children,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const t = typography[variant];
  const w = weight ?? t.weight;
  return (
    <RNText
      lineBreakStrategyIOS="hangul-word"
      maxFontSizeMultiplier={variant.startsWith("display") ? DISPLAY_MAX_FONT_SCALE : undefined}
      {...rest}
      style={[
        {
          fontFamily: fonts.sans[w],
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          color: colors[color],
        },
        style,
      ]}
    >
      {mixFonts(children, { ja: fonts.ja[w], latin: fonts.latin[w] })}
    </RNText>
  );
}

/**
 * 문자열 · 숫자 자식만 나누고, 다른 컴포넌트는 그대로 둔다.
 * Children.map 은 바로 아래 자식만 본다. Fragment 나 다른 컴포넌트(i18n 의 <Trans> 등) 안의 글자는 나누지 못해서
 * 그 안의 영어 · 일본어도 Noto Sans KR 로 그려진다. 그런 경우는 안쪽 글자를 각각 Text 로 감싼다.
 */
function mixFonts(children: ReactNode, families: Record<"ja" | "latin", string>): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== "string" && typeof child !== "number") return child;
    const runs = splitByScript(String(child));
    // 바깥 Text 가 Noto Sans KR 이므로 한국어만 있는 글은 감쌀 필요가 없다.
    if (runs.every((r) => r.script === "ko")) return child;
    return runs.map((r, i) =>
      r.script === "ko" ? (
        r.text
      ) : (
        <RNText key={i} style={{ fontFamily: families[r.script] }}>
          {r.text}
        </RNText>
      )
    );
  });
}
