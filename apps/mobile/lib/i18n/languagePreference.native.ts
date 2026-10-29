import Storage from "expo-sqlite/kv-store";

import { storageKeys } from "@deckodecko/core";

import { isLanguage, type Language } from "./types";

// 한 번 읽거나 저장한 값을 들고 있어 기기 언어가 바뀔 때마다 디스크를 다시 읽지 않는다
let cached: Language | null | undefined;

/** 설정에서 고른 언어. 고른 적이 없거나 읽지 못하면 null (기기 언어를 따른다). 첫 화면 전에 읽으려고 처음 한 번은 동기로 읽는다. */
export function loadLanguagePreference(): Language | null {
  if (cached === undefined) {
    try {
      const saved = Storage.getItemSync(storageKeys.language);
      cached = saved !== null && isLanguage(saved) ? saved : null;
    } catch {
      cached = null;
    }
  }
  return cached;
}

/** 고른 언어를 기억한다. 저장은 기다리지 않는다 (실패해도 지금 화면의 언어는 바뀐다). */
export function saveLanguagePreference(language: Language): void {
  cached = language;
  Storage.setItemAsync(storageKeys.language, language).catch((e: unknown) =>
    console.warn("언어 설정을 저장하지 못했습니다.", e)
  );
}
