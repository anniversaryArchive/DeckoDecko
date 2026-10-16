"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { defaultThemeName, themes, type ThemeName } from "./themes";
import type { Theme } from "./tokens";

const ThemeContext = createContext<Theme>(themes[defaultThemeName]);

type ProviderProps = {
  /** 테마 이름. 나중에 설정 화면에서 고른 값을 넘긴다. 생략하면 기본 테마. */
  theme?: ThemeName;
  children: ReactNode;
};

/** 앱(React Native)과 웹 클라이언트 컴포넌트에서 쓰는 테마 공급자. 루트 레이아웃에 한 번 감싼다. */
export function ThemeProvider({ theme = defaultThemeName, children }: ProviderProps) {
  const value = useMemo(() => themes[theme], [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** 현재 테마. 화면 코드는 이걸로만 색을 얻는다. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
