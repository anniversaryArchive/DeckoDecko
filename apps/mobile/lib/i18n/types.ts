import type { ko } from "./ko";

/** ko.ts 와 같은 키 모양, 값은 아무 문자열. 다른 언어 파일의 타입으로 쓴다. */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

export type Messages = DeepStrings<typeof ko>;

/** 앱이 지원하는 언어. 기기 언어가 여기 없으면 ko 로 보인다. */
export const languages = ["ko", "en"] as const;
export type Language = (typeof languages)[number];
