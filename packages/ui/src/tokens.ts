/**
 * 디자인 토큰. 디자인 캔버스(시안 B)의 값을 그대로 옮긴 것이며, 색·글꼴·간격의 유일한 출처다.
 * 앱(React Native)과 백오피스(Next.js)가 같은 값을 import 한다.
 * 값을 바꾸면 여기 한 곳만 고친다. apps/mobile/app.json 의 backgroundColor 는 JSON 이라 import 할 수 없어
 * colors.bg 와 같은 값을 손으로 맞춘다.
 */
export const colors = {
  bg: "#FFF9F4",
  surface: "#FFFFFF",
  line: "#F1E4DA",
  accent: "#D9573F",
  peach: "#FF8E7A",
  peachLight: "#FFE3D8",
  sage: "#CFE8D5",
  sageInk: "#2E6B4B",
  ink: "#2B2622",
  muted: "#7A7068",
} as const;

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

export type ColorToken = keyof typeof colors;
