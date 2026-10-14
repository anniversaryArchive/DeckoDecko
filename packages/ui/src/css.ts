import type { Theme, ThemeColors, ThemeShadows } from "./tokens";

type CssVars = Record<`--color-${keyof ThemeColors}` | `--shadow-${keyof ThemeShadows}`, string>;

/**
 * 웹용: 테마를 CSS 변수로 바꾼다 (`--color-bg`, `--shadow-toast` …). <html style> 에 넣는다.
 * Next.js 서버 컴포넌트(layout.tsx)에서 import 하므로 이 파일에는 React(훅, Context)를 넣지 않는다.
 */
export function themeToCssVars(theme: Theme): CssVars {
  const vars = {} as CssVars;
  for (const key of Object.keys(theme.colors) as (keyof ThemeColors)[]) {
    vars[`--color-${key}`] = theme.colors[key];
  }
  for (const key of Object.keys(theme.shadows) as (keyof ThemeShadows)[]) {
    vars[`--shadow-${key}`] = theme.shadows[key];
  }
  return vars;
}
