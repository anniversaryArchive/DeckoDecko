import { describe, expect, it } from "vitest";

import { flattenPages, nextPageOffset } from "./pagination";
import { GACHA_DEFAULTS } from "./repositories/gacha";
import { createMemoryGachaRepository } from "./repositories/gacha.memory";
import type { GachaDetail, Page } from "./types";

const page = (idList: string[], total: number): Page<{ id: string }> => ({
  items: idList.map((id) => ({ id })),
  total,
});

describe("nextPageOffset", () => {
  it("받은 개수가 total 보다 적으면 받은 개수가 다음 offset", () => {
    expect(nextPageOffset([page(["a", "b"], 5)])).toBe(2);
    expect(nextPageOffset([page(["a", "b"], 5), page(["c", "d"], 5)])).toBe(4);
  });

  it("total 만큼 받았으면 끝 (undefined)", () => {
    expect(nextPageOffset([page(["a", "b"], 4), page(["c", "d"], 4)])).toBeUndefined();
    expect(nextPageOffset([page(["a"], 1)])).toBeUndefined();
  });

  it("마지막 페이지가 비었으면 total 이 남아 있어도 끝", () => {
    expect(nextPageOffset([page(["a"], 5), page([], 5)])).toBeUndefined();
  });

  it("결과가 없거나 페이지가 없으면 끝", () => {
    expect(nextPageOffset([page([], 0)])).toBeUndefined();
    expect(nextPageOffset([])).toBeUndefined();
  });
});

describe("flattenPages", () => {
  it("페이지를 순서대로 잇고 total 은 마지막 페이지 값", () => {
    expect(flattenPages([page(["a", "b"], 5), page(["c"], 4)])).toEqual({
      items: [{ id: "a" }, { id: "b" }, { id: "c" }],
      total: 4,
    });
  });

  it("두 페이지에 걸친 같은 id 는 처음 것만 남긴다", () => {
    const flat = flattenPages([page(["a", "b"], 4), page(["b", "c"], 4)]);
    expect(flat.items.map((g) => g.id)).toEqual(["a", "b", "c"]);
  });

  it("페이지가 없으면 빈 목록 · 0", () => {
    expect(flattenPages([])).toEqual({ items: [], total: 0 });
  });
});

describe("메모리 저장소로 끝까지 스크롤", () => {
  const seed: GachaDetail[] = Array.from({ length: 23 }, (_, i) => ({
    id: `g${i + 1}`,
    name: "マスコット",
    nameKo: null,
    imageUrl: null,
    media: null,
    price: null,
    releaseMonth: null,
    itemCount: null,
    items: [],
  }));

  /** 화면이 하는 대로 다음 offset 이 없을 때까지 한 페이지씩 받는다 */
  async function scrollToEnd(total: number) {
    const repo = createMemoryGachaRepository(seed.slice(0, total));
    const limit = GACHA_DEFAULTS.searchPageSize;
    const pages: Page<{ id: string }>[] = [await repo.searchGacha({ keyword: "マスコ", limit })];
    let offset = nextPageOffset(pages);
    while (offset !== undefined) {
      pages.push(await repo.searchGacha({ keyword: "マスコ", limit, offset }));
      offset = nextPageOffset(pages);
    }
    return pages;
  }

  it("20개는 10개씩 두 페이지, 이은 개수가 total 과 같다", async () => {
    const pages = await scrollToEnd(20);
    expect(pages.map((p) => p.items.length)).toEqual([10, 10]);
    const flat = flattenPages(pages);
    expect(flat.items).toHaveLength(20);
    expect(flat.total).toBe(20);
  });

  it("페이지 경계가 맞지 않으면(23개) 마지막 페이지는 남은 3개", async () => {
    const pages = await scrollToEnd(23);
    expect(pages.map((p) => p.items.length)).toEqual([10, 10, 3]);
    const flat = flattenPages(pages);
    expect(flat.items.map((g) => g.id)).toEqual(seed.map((g) => g.id));
    expect(flat.total).toBe(23);
  });

  it("한 페이지보다 적으면 한 번만 받는다", async () => {
    const pages = await scrollToEnd(7);
    expect(pages).toHaveLength(1);
    expect(flattenPages(pages).total).toBe(7);
  });
});
