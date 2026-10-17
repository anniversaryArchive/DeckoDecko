import type { Gacha, Media } from "@deckodecko/core";

/**
 * 화면에 보일 이름 고르기. 한국어면 한국어 이름, 그 밖의 언어는 번역이 없으므로 원제목(일본어)을 쓴다.
 * 작품은 영어 제목이 있으면 영어, 없으면 원제목 → 한국어 순.
 */
export function gachaName(gacha: Pick<Gacha, "name" | "nameKo">, language: string): string {
  return language === "ko" ? (gacha.nameKo ?? gacha.name) : gacha.name;
}

export function mediaTitle(media: Media, language: string): string {
  return language === "ko" ? media.title : (media.titleEn ?? media.titleJa ?? media.title);
}
