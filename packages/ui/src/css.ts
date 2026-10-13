import type { Theme, ThemeColors } from "./tokens";

/** 웹용: 테마 색을 CSS 변수로 바꾼다 (`--color-bg`, `--color-text` …). <html style> 에 넣는다. React 에 의존하지 않는다. */
export function themeToCssVars(theme: Theme): Record<`--color-${keyof ThemeColors}`, string> {
  const vars = {} as Record<`--color-${keyof ThemeColors}`, string>;
  for (const key of Object.keys(theme.colors) as (keyof ThemeColors)[]) {
    vars[`--color-${key}`] = theme.colors[key];
  }
  return vars;
}
