import { describe, expect, it } from "vitest";

import type { Item } from "@deckodecko/core";

import { countByFolder, groupByGacha, searchGoods } from "./goods";

function item(id: string, gachaId: string, name: string, folderId = "f0"): Item {
  return {
    id,
    gachaId,
    folderId,
    type: "GET",
    name,
    thumbnail: null,
    memo: null,
    createdAt: "2026-10-27T00:00:00.000Z",
    updatedAt: "2026-10-27T00:00:00.000Z",
  };
}

const items = [
  item("1", "g1", "Rabbit"),
  item("2", "g2", "다람쥐"),
  item("3", "g1", "고양이", "f1"),
];
const gachas = new Map([
  ["g1", { name: "うさぎマスコット", nameKo: "토끼 마스코트" }],
  ["g2", { name: "Forest Friends", nameKo: null }],
]);

describe("searchGoods", () => {
  it("빈 검색어 · 공백뿐이면 모두 남긴다", () => {
    expect(searchGoods(items, gachas, "")).toEqual(items);
    expect(searchGoods(items, gachas, "  ")).toEqual(items);
  });

  it("아이템 이름 부분 일치, 대소문자 · 전각 무시", () => {
    expect(searchGoods(items, gachas, "rab").map((i) => i.id)).toEqual(["1"]);
    expect(searchGoods(items, gachas, "ＲＡＢ").map((i) => i.id)).toEqual(["1"]);
  });

  it("가챠 이름(원문 · 한국어)으로도 찾는다", () => {
    expect(searchGoods(items, gachas, "마스코트").map((i) => i.id)).toEqual(["1", "3"]);
    expect(searchGoods(items, gachas, "うさぎ").map((i) => i.id)).toEqual(["1", "3"]);
    expect(searchGoods(items, gachas, "forest").map((i) => i.id)).toEqual(["2"]);
  });

  it("가챠 정보가 없으면 아이템 이름으로만 찾는다", () => {
    expect(searchGoods(items, new Map(), "마스코트")).toEqual([]);
    expect(searchGoods(items, new Map(), "다람").map((i) => i.id)).toEqual(["2"]);
  });
});

describe("groupByGacha", () => {
  it("처음 나온 순서대로 가챠를 묶고, 묶음 안 순서를 지킨다", () => {
    expect(groupByGacha(items).map((g) => [g.gachaId, g.items.map((i) => i.id)])).toEqual([
      ["g1", ["1", "3"]],
      ["g2", ["2"]],
    ]);
  });

  it("빈 목록이면 빈 묶음", () => {
    expect(groupByGacha([])).toEqual([]);
  });
});

describe("countByFolder", () => {
  it("폴더별 기록 수", () => {
    expect(countByFolder(items)).toEqual(
      new Map([
        ["f0", 2],
        ["f1", 1],
      ])
    );
  });
});
