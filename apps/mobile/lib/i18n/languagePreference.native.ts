import Storage from "expo-sqlite/kv-store";

import { languages, type Language } from "./types";

const KEY = "settings.language";

/** 설정에서 고른 언어. 고른 적이 없거나 읽지 못하면 null (기기 언어를 따른다). 첫 화면 전에 읽으려고 동기 API 를 쓴다. */
export function loadLanguagePreference(): Language | null {
  try {
    const saved = Storage.getItemSync(KEY);
    return languages.find((l) => l === saved) ?? null;
  } catch {
    return null;
  }
}

export function saveLanguagePreference(language: Language): void {
  Storage.setItemSync(KEY, language);
}
