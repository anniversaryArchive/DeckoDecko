import { getLocales, type Locale } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./en";
import { ko } from "./ko";
import { loadLanguagePreference, saveLanguagePreference } from "./languagePreference";
import { languages, type Language } from "./types";

/** 기기 언어 목록에서 앱이 지원하는 첫 언어. 없으면 en (앱 이름도 ko 가 아니면 영어다, app.json). */
export function pickLanguage(locales: readonly Locale[]): Language {
  for (const { languageCode } of locales) {
    const found = languages.find((l) => l === languageCode);
    if (found) return found;
  }
  return "en";
}

// 앱이 읽히자마자 한 번 초기화한다. 리소스가 코드 안에 있어 동기로 끝나므로 첫 화면부터 번역된다.
void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: loadLanguagePreference() ?? pickLanguage(getLocales()),
  fallbackLng: "en",
  supportedLngs: languages,
  // React 가 이미 이스케이프한다
  interpolation: { escapeValue: false },
  initAsync: false,
});

/** 기기 언어가 바뀌었을 때 따라간다. 설정에서 언어를 고른 적이 있으면 그 언어를 지킨다. */
export function followDeviceLanguage(locales: readonly Locale[]): void {
  if (loadLanguagePreference()) return;
  const next = pickLanguage(locales);
  if (i18n.language !== next) void i18n.changeLanguage(next);
}

/** 설정에서 언어를 고른다. 앱을 다시 켜도 이 언어로 시작한다. */
export function chooseLanguage(language: Language): void {
  saveLanguagePreference(language);
  void i18n.changeLanguage(language);
}

export { i18n };
export { languageOptions, languages, type Language } from "./types";
export {
  formatDate,
  formatShortDate,
  formatFolderItemCount,
  formatItemCount,
  formatMonth,
  formatNumber,
  formatPercent,
  formatPrice,
} from "./format";
