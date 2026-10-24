import type { Theme } from "../tokens";
import { peachCream } from "./peachCream";

/**
 * 테마 목록. 새 테마를 추가하려면
 *   1. 이 폴더에 `<이름>.ts` 를 만들어 Theme 의 colors · shadows · folders 를 모두 채운다 (빠진 역할은 타입 오류로 잡힌다).
 *      새 원색이 필요하면 tokens.ts 의 palette 에 추가한다.
 *   2. 아래 themes 에 한 줄 추가한다.
 * 화면 코드 · 컴포넌트는 바꾸지 않는다. 역할 이름이 부족하면 ThemeColors 에 역할을 추가하고 모든 테마를 채운다.
 */
export const themes = {
  peachCream,
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;

/**
 * 처음 설치했을 때의 테마.
 * apps/mobile/app.json 의 backgroundColor(스플래시 바탕)는 JSON 이라 import 할 수 없어 이 테마의 bg 와 손으로 맞춘다.
 */
export const defaultThemeName: ThemeName = "peachCream";

/** 설정 화면 선택지처럼 테마를 나열할 때 쓴다. */
export const themeNames = Object.keys(themes) as ThemeName[];
