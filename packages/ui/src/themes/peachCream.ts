import { palette, type Theme } from "../tokens";

/** 피치 크림: 크림 바탕에 피치 · 세이지 두 가지 파스텔. 디자인 캔버스의 기본 팔레트. */
export const peachCream = {
  name: "피치 크림",
  scheme: "light",
  colors: {
    bg: palette.cream,
    surface: palette.white,
    line: palette.sand,
    lineSoft: palette.creamDeep,
    text: palette.ink,
    textMuted: palette.stone,
    textPlaceholder: palette.pebble,
    textFaint: palette.stoneLight,
    accent: palette.coral,
    onAccent: palette.white,
    primary: palette.peach,
    onPrimary: palette.ink,
    accentSoft: palette.peachLight,
    highlightSurface: palette.blush,
    highlightLine: palette.blushLine,
    wishSurface: palette.peachLight,
    onWish: palette.coral,
    getSurface: palette.sage,
    onGet: palette.sageDeep,
    getMark: palette.sageMid,
    inverse: palette.ink,
    onInverse: palette.white,
    onInverseMuted: palette.mist,
    scrim: palette.inkScrim,
  },
  shadows: {
    // ink(#2B2622) 25% · 12%
    toast: "0 8px 24px rgba(43, 38, 34, 0.25)",
    popover: "0 10px 30px rgba(43, 38, 34, 0.12)",
  },
  folders: {
    default: { fill: palette.creamDeep, stroke: palette.stone },
    cycle: [
      { fill: palette.peachLight, stroke: palette.coral },
      { fill: palette.sage, stroke: palette.sageDeep },
    ],
  },
} as const satisfies Theme;
