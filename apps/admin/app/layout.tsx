import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";

import { defaultThemeName, fonts, themeToCssVars, themes } from "@deckodecko/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "가챠 탐색대 백오피스",
  description: "가챠 카탈로그 · 공지 · 아이템 이미지 관리",
};

/** 테마 색을 CSS 변수(--color-*)로 내려 globals.css 가 같은 값을 쓰게 한다. 테마를 바꾸면 여기 한 줄. */
const themeVars = {
  ...themeToCssVars(themes[defaultThemeName]),
  "--font-sans": fonts.sans.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", "),
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" style={themeVars}>
      <body>{children}</body>
    </html>
  );
}
