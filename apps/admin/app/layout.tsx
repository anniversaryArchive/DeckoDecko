import { colors, fonts } from "@deckodecko/ui";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "가챠 탐색대 백오피스",
  description: "가챠 카탈로그 · 공지 · 아이템 이미지 관리",
};

/** 디자인 토큰을 CSS 변수로 내려 globals.css 가 같은 값을 쓰게 한다. */
const themeVars = {
  "--bg": colors.bg,
  "--surface": colors.surface,
  "--line": colors.line,
  "--ink": colors.ink,
  "--muted": colors.muted,
  "--accent": colors.accent,
  "--font-sans": fonts.sans.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", "),
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" style={themeVars}>
      <body>{children}</body>
    </html>
  );
}
