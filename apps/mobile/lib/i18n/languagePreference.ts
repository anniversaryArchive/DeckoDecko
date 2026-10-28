import type { Language } from "./types";

/**
 * 웹용. 웹은 출시 대상이 아니라 sqlite 를 번들에 넣지 않으므로(lib/db/client.ts 참고) 기억하지 않는다.
 * 실제 구현은 `languagePreference.native.ts`.
 */
let preference: Language | null = null;

export function loadLanguagePreference(): Language | null {
  return preference;
}

export function saveLanguagePreference(language: Language): void {
  preference = language;
}
