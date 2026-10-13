/**
 * 디자인 토큰. 세 층으로 나뉜다.
 *   palette  — 원색 값. 화면 코드에서 직접 쓰지 않는다.
 *   Theme    — 역할(배경, 글자, 포인트, WISH/GET …)에 palette 를 배정한 것. 테마마다 한 벌.
 *   공통     — fonts, radius, space 는 테마와 무관하게 하나.
 * 새 테마를 추가하려면 themes 에 항목을 하나 더 넣으면 된다. 화면 코드는 useTheme() 로 받은 역할 이름만 쓴다.
 * apps/mobile/app.json 의 backgroundColor 는 JSON 이라 import 할 수 없어 기본 테마의 bg 와 손으로 맞춘다.
 */

export const palette = {
  cream: "#FFF9F4",
  white: "#FFFFFF",
  sand: "#F1E4DA",
  coral: "#D9573F",
  peach: "#FF8E7A",
  peachLight: "#FFE3D8",
  sage: "#CFE8D5",
  sageDeep: "#2E6B4B",
  ink: "#2B2622",
  stone: "#7A7068",
} as const;

/** 화면이 쓰는 색 역할. 테마가 바뀌어도 이 이름은 그대로다. */
export type ThemeColors = {
  /** 화면 바탕 */
  bg: string;
  /** 카드·시트 면 */
  surface: string;
  /** 카드 테두리, 구분선 */
  line: string;
  /** 기본 글자 */
  text: string;
  /** 보조 글자 */
  textMuted: string;
  /** 포인트 (활성 탭, 링크, 강조 숫자) */
  accent: string;
  /** 주요 버튼 면 */
  primary: string;
  /** 주요 버튼 위 글자 */
  onPrimary: string;
  /** 연한 포인트 면 (상세 상단, 칩 배경) */
  accentSoft: string;
  /** WISH 태그 면 / 글자 */
  wishBg: string;
  wishFg: string;
  /** GET 태그 면 / 글자 */
  getBg: string;
  getFg: string;
};

export type Theme = {
  name: string;
  /** 상태 바·시스템 UI 가 밝은 바탕용인지 */
  scheme: "light" | "dark";
  colors: ThemeColors;
};

export const themes = {
  peachCream: {
    name: "피치 크림",
    scheme: "light",
    colors: {
      bg: palette.cream,
      surface: palette.white,
      line: palette.sand,
      text: palette.ink,
      textMuted: palette.stone,
      accent: palette.coral,
      primary: palette.peach,
      onPrimary: palette.ink,
      accentSoft: palette.peachLight,
      wishBg: palette.peachLight,
      wishFg: palette.coral,
      getBg: palette.sage,
      getFg: palette.sageDeep,
    },
  },
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;
export const defaultThemeName: ThemeName = "peachCream";

export const fonts = {
  /** 한글 본문. 숫자·영문은 Inter 가 앞에 온다. */
  sans: ["Inter", "Noto Sans KR", "Apple SD Gothic Neo", "system-ui", "sans-serif"] as const,
  weight: { regular: 400, medium: 500, bold: 700 } as const,
} as const;

export const radius = {
  card: 22,
  chip: 999,
  thumb: 12,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;
