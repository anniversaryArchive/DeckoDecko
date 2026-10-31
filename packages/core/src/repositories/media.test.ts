import { describe, expect, it } from "vitest";

import { MEDIA_DEFAULTS, searchMedia, type MediaEntry } from "./media";

// 목 데이터가 바뀌어도 깨지지 않도록 seed 를 직접 만든다.

function media(id: string, title: string, overrides: Partial<MediaEntry> = {}): MediaEntry {
  return { id, title, titleJa: null, titleEn: null, kind: null, ...overrides };
}

const seed: MediaEntry[] = [
  media("m-1", "고양이 카페 일기", { titleJa: "ねこカフェ日記", aliases: ["냥카페"] }),
  media("m-2", "별의 숲", { titleJa: "星の森", titleEn: "Starry Forest", aliases: ["별숲"] }),
  media("m-3", "숲속 고양이"),
];

const ids = (list: { id: string }[]) => list.map((m) => m.id);

describe("searchMedia", () => {
  it("한 · 일 · 영 이름과 별칭으로 찾는다 (공백 · 대소문자 · 전각 무시)", () => {
    expect(ids(searchMedia(seed, { keyword: "星の" }))).toEqual(["m-2"]);
    expect(ids(searchMedia(seed, { keyword: "starry FOREST" }))).toEqual(["m-2"]);
    expect(ids(searchMedia(seed, { keyword: "ｓｔａｒｒｙ" }))).toEqual(["m-2"]);
    expect(ids(searchMedia(seed, { keyword: "냥카" }))).toEqual(["m-1"]);
    expect(ids(searchMedia(seed, { keyword: "별 숲" }))).toEqual(["m-2"]);
  });

  it("결과에는 별칭을 싣지 않는다", () => {
    const [hit] = searchMedia(seed, { keyword: "별숲" });
    expect(hit).toEqual({
      id: "m-2",
      title: "별의 숲",
      titleJa: "星の森",
      titleEn: "Starry Forest",
      kind: null,
    });
  });

  it("이름이나 별칭이 검색어로 시작하는 작품이 앞에 온다", () => {
    // "숲속 고양이" 는 시작 일치, "별의 숲" 은 중간 일치
    expect(ids(searchMedia(seed, { keyword: "숲" }))).toEqual(["m-3", "m-2"]);
    expect(ids(searchMedia(seed, { keyword: "고양이" }))).toEqual(["m-1", "m-3"]);
    // b 는 이름이 중간 일치지만 별칭 "카페냥" 이 시작 일치라 앞에 온다
    const withAlias: MediaEntry[] = [
      media("a", "거리의 카페"),
      media("b", "고양이 카페", { aliases: ["카페냥"] }),
    ];
    expect(ids(searchMedia(withAlias, { keyword: "카페" }))).toEqual(["b", "a"]);
  });

  it("시작 일치가 limit 만큼 모이면 중간 일치는 싣지 않는다", () => {
    const list = [media("mid", "별의 숲"), media("p1", "숲 1"), media("p2", "숲 2")];
    expect(ids(searchMedia(list, { keyword: "숲", limit: 2 }))).toEqual(["p1", "p2"]);
  });

  it("빈 검색어는 빈 배열, limit 이 이상하면 기본값", () => {
    const many = Array.from({ length: 15 }, (_, i) => media(`m-${i}`, `작품 ${i}`));
    expect(searchMedia(many, { keyword: "  " })).toEqual([]);
    expect(searchMedia(many, { keyword: "작품", limit: 3 })).toHaveLength(3);
    for (const limit of [0, -1, 1.5, Number.NaN]) {
      expect(searchMedia(many, { keyword: "작품", limit })).toHaveLength(
        MEDIA_DEFAULTS.searchLimit
      );
    }
  });

  it("돌려준 객체를 고쳐도 목록은 바뀌지 않는다", () => {
    const [hit] = searchMedia(seed, { keyword: "별숲" });
    hit!.title = "바뀜";
    expect(searchMedia(seed, { keyword: "별숲" })[0]!.title).toBe("별의 숲");
  });
});
