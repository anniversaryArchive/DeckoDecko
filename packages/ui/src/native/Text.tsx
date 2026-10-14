import { Children, type ReactNode } from "react";
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
  /** 색 역할. 생략하면 text */
  color?: keyof ThemeColors;
};

/**
 * 한글 · 한자 · 일본어(전각 문자 포함)인지. 이 글자들은 Noto Sans KR, 나머지는 Inter 로 그린다.
 * ♪ ♀ 처럼 Inter 에 없는 특수기호는 일부러 넣지 않았다. 휴대폰이 시스템 글꼴로 대신 그린다.
 */
function isCjk(code: number) {
  return (
    (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
    (code >= 0x3000 && code <= 0x30ff) || // CJK 기호, 히라가나, 가타카나
    (code >= 0x3130 && code <= 0x318f) || // 한글 호환 자모
    (code >= 0x3190 && code <= 0x31ff) || // 한문 훈점, CJK 획, 가타카나 확장
    (code >= 0x3200 && code <= 0x33ff) || // 괄호 · 원문자 한글 · 한자(㈜), CJK 단위(㎝ ㎏ ㎡)
    (code >= 0x3400 && code <= 0x4dbf) || // 한자 확장 A
    (code >= 0x4e00 && code <= 0x9fff) || // 한자
    (code >= 0xa960 && code <= 0xa97f) || // 한글 자모 확장 A (옛한글)
    (code >= 0xac00 && code <= 0xd7af) || // 한글 음절
    (code >= 0xd7b0 && code <= 0xd7ff) || // 한글 자모 확장 B (옛한글)
    (code >= 0xf900 && code <= 0xfaff) || // 호환 한자
    (code >= 0xfe30 && code <= 0xfe4f) || // CJK 호환 형태 (세로쓰기 부호)
    (code >= 0xff00 && code <= 0xffef) // 전각 · 반각 문자
  );
}

type Run = { text: string; cjk: boolean };

/**
 * 문자열을 글꼴이 같은 덩어리로 나눈다.
 * "마스코트 Vol.2 (1회)" → [마스코트 ] [Vol.2 (1] [회] [)]
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
    const cjk = isCjk(ch.codePointAt(0) ?? 0);
    if (last && last.cjk === cjk) last.text += ch;
    else runs.push({ text: ch, cjk });
  }
  return runs;
}

/**
 * 앱의 모든 글자는 이 Text 로 쓴다. 화면에서 fontFamily · fontSize 를 직접 적지 않는다.
 *
 * 글꼴은 글자를 보고 자동으로 고른다: 한글 · 한자 · 일본어는 Noto Sans KR, 영어 · 숫자 · 특수문자는 Inter.
 * DB 에서 온 가챠 이름이나 번역 문장처럼 무엇이 섞였는지 모르는 글도 그대로 넘기면 된다.
 * RN 은 Text 하나에 글꼴 하나라서, Inter 덩어리만 안쪽 Text 로 감싸 한 문단 안에서 글꼴을 바꾼다.
 *
 * RN 은 굵기마다 family 가 달라서 fontWeight 대신 weight 로 family 를 고른다.
 * style 로 fontWeight 를 넘기지 않는다 (Android 에서 커스텀 글꼴이 시스템 글꼴로 바뀐다).
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
      {mixFonts(children, fonts.latin[w])}
    </RNText>
  );
}

/** 문자열 · 숫자 자식만 나누고, 다른 컴포넌트는 그대로 둔다. */
function mixFonts(children: ReactNode, latinFamily: string): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== "string" && typeof child !== "number") return child;
    const runs = splitByScript(String(child));
    // 바깥 Text 가 Noto Sans KR 이므로 한글만 있는 글은 감쌀 필요가 없다.
    if (runs.every((r) => r.cjk)) return child;
    return runs.map((r, i) =>
      r.cjk ? (
        r.text
      ) : (
        <RNText key={i} style={{ fontFamily: latinFamily }}>
          {r.text}
        </RNText>
      )
    );
  });
}
