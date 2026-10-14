import type { GachaDetail, Media } from "@deckodecko/core";

/**
 * 개발용 목 카탈로그. Supabase 연결(2주차) 전까지 홈 · 검색 · 상세가 이 데이터로 돈다.
 * 20개로 늘리는 건 #107 에서. 이름은 디자인 캔버스 예시를 따른다. 이미지는 아직 없다.
 */

const media = {
  starryForest: {
    id: "m-starry-forest",
    title: "별의 숲",
    titleJa: "星の森",
    titleEn: "Starry Forest",
    kind: "anime",
    imageUrl: null,
  },
  catCafe: {
    id: "m-cat-cafe",
    title: "고양이 카페 일기",
    titleJa: "ねこカフェ日記",
    titleEn: "Cat Cafe Diary",
    kind: "anime",
    imageUrl: null,
  },
} satisfies Record<string, Media>;

function items(gachaId: string, names: [ja: string, ko: string][]): GachaDetail["items"] {
  return names.map(([name, nameKo], i) => ({
    id: `${gachaId}-${i + 1}`,
    gachaId,
    number: i + 1,
    name,
    nameKo,
    imageUrl: null,
  }));
}

export const mockCatalog: GachaDetail[] = [
  {
    id: "g-forest-mascot-3",
    name: "森のなかまマスコット Vol.3",
    nameKo: "숲속 친구들 마스코트 Vol.3",
    imageUrl: null,
    media: media.starryForest,
    price: 400,
    releaseMonth: "2026-11",
    itemCount: 6,
    items: items("g-forest-mascot-3", [
      ["リス（どんぐり）", "다람쥐 (도토리)"],
      ["ウサギ（にんじん）", "토끼 (당근)"],
      ["ハリネズミ", "고슴도치"],
      ["キツネ", "여우"],
      ["フクロウ", "올빼미"],
      ["シカ", "사슴"],
    ]),
  },
  {
    id: "g-forest-mascot-2",
    name: "森のなかまマスコット Vol.2",
    nameKo: "숲속 친구들 마스코트 Vol.2",
    imageUrl: null,
    media: media.starryForest,
    price: 400,
    releaseMonth: "2026-10",
    itemCount: 5,
    items: items("g-forest-mascot-2", [
      ["クマ", "곰"],
      ["タヌキ", "너구리"],
      ["ヤマネ", "산쥐"],
      ["カワウソ", "수달"],
      ["モグラ", "두더지"],
    ]),
  },
  {
    id: "g-cat-cafe-mini-2",
    name: "ねこカフェ日記 ミニフィギュア2",
    nameKo: "고양이 카페 일기 미니 피규어 2",
    imageUrl: null,
    media: media.catCafe,
    price: 500,
    releaseMonth: "2026-11",
    itemCount: 4,
    items: items("g-cat-cafe-mini-2", [
      ["店長", "점장"],
      ["ミケ", "삼색이"],
      ["クロ", "까망이"],
      ["シロ", "하양이"],
    ]),
  },
];
