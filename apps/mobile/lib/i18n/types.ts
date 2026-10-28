import type { ko } from "./ko";

/** ko.ts 와 같은 키 모양, 값은 아무 문자열. 다른 언어 파일의 타입으로 쓴다. */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

export type Messages = DeepStrings<typeof ko>;

/** 앱이 지원하는 언어. 기기 언어가 여기 없으면 en 으로 보인다. */
export const languages = ["ko", "en"] as const;
export type Language = (typeof languages)[number];

/** 설정 화면의 언어 목록. 이름은 그 언어로 적어서 어느 언어로 보든 같다. comingSoon 은 번역 전이라 고를 수 없다. */
export const languageOptions: readonly {
  code: Language | "ja";
  name: string;
  comingSoon?: true;
}[] = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語", comingSoon: true },
];
