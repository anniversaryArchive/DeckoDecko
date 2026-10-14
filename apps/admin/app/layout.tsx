import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

import { defaultThemeName, fonts, themeToCssVars, themes } from "@deckodecko/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "가챠 탐색대 백오피스",
  description: "가챠 카탈로그 · 공지 · 아이템 이미지 관리",
};

/** 앱과 같은 글꼴 · 굵기. next/font 가 빌드 때 받아 자체 호스팅한다. */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});
// 한글 글꼴은 용량이 커서 미리 받지(preload) 않고, 쓰일 때 글자 묶음 단위로 받는다.
const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  preload: false,
  variable: "--font-noto-sans-kr",
});

/** fonts.web 스택의 글꼴 이름을 next/font 가 만든 변수로 바꾼다. 나머지는 시스템 폴백. */
const fontStack = fonts.web
  .map((f) =>
    f === "Inter"
      ? "var(--font-inter)"
      : f === "Noto Sans KR"
        ? "var(--font-noto-sans-kr)"
        : f.includes(" ")
          ? `"${f}"`
          : f
  )
  .join(", ");

/** 테마 색을 CSS 변수(--color-*)로 내려 globals.css 가 같은 값을 쓰게 한다. 테마를 바꾸면 여기 한 줄. */
const themeVars = {
  ...themeToCssVars(themes[defaultThemeName]),
  "--font-sans": fontStack,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`} style={themeVars}>
      <body>{children}</body>
    </html>
  );
}
