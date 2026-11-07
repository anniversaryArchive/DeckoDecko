import { describe, expect, it } from "vitest";

import type { GachaDetail, Media } from "../types";
import { createMemoryGachaRepository } from "./gacha.memory";

// 목 카탈로그가 바뀌어도 깨지지 않도록 테스트마다 작은 seed 를 직접 만든다.

const starry: Media = {
  id: "m-starry",
  title: "별의 숲",
  titleJa: "星の森",
  titleEn: "Starry Forest",
  kind: "anime",
};

const noJaEn: Media = {
  id: "m-plain",
  title: "평범한 작품",
  titleJa: null,
  titleEn: null,
  kind: null,
};

function gacha(
  id: string,
  overrides: Partial<Omit<GachaDetail, "items">> = {},
  itemCount = 0
): GachaDetail {
  return {
    id,
    name: `name-${id}`,
    nameKo: null,
    imageUrl: null,
    media: null,
    price: null,
    releaseMonth: null,
    itemCount,
    items: Array.from({ length: itemCount }, (_, i) => ({
      id: `${id}-${i + 1}`,
      gachaId: id,
      number: i + 1,
      name: `item-${i + 1}`,
      nameKo: null,
      imageUrl: null,
    })),
    ...overrides,
  };
}

/** id 만 다르고 나머지는 같은 seed n 개 (페이지네이션 · 기본 limit 용) */
function many(n: number, overrides: Partial<Omit<GachaDetail, "items">> = {}): GachaDetail[] {
  return Array.from({ length: n }, (_, i) => gacha(`g${i + 1}`, overrides));
}

const ids = (list: { id: string }[]) => list.map((g) => g.id);

describe("createMemoryGachaRepository", () => {
  describe("listGacha", () => {
    it("받은 순서 그대로 돌려준다", async () => {
      const repo = createMemoryGachaRepository([gacha("a"), gacha("b"), gacha("c")]);
      expect(ids(await repo.listGacha())).toEqual(["a", "b", "c"]);
    });

    it("limit 을 생략하면 기본 20개까지만 돌려준다", async () => {
      const repo = createMemoryGachaRepository(many(25));
      const list = await repo.listGacha();
      expect(list).toHaveLength(20);
      expect(list[0]?.id).toBe("g1");
      expect(list[19]?.id).toBe("g20");
    });

    it("limit 만큼만 돌려준다", async () => {
      const repo = createMemoryGachaRepository(many(5));
      expect(ids(await repo.listGacha({ limit: 2 }))).toEqual(["g1", "g2"]);
    });

    it("limit 이 전체보다 크면 있는 만큼 돌려준다", async () => {
      const repo = createMemoryGachaRepository(many(3));
      expect(await repo.listGacha({ limit: 100 })).toHaveLength(3);
    });

    it("seed 가 비어 있으면 빈 배열", async () => {
      const repo = createMemoryGachaRepository([]);
      expect(await repo.listGacha()).toEqual([]);
    });

    it("요약에는 items 필드가 없다", async () => {
      const repo = createMemoryGachaRepository([gacha("a", {}, 3)]);
      const [first] = await repo.listGacha();
      expect(first).toBeDefined();
      expect(first).not.toHaveProperty("items");
      expect(first).toMatchObject({ id: "a", itemCount: 3 });
    });

    it("limit 이 양의 정수가 아니면 기본 20개", async () => {
      const repo = createMemoryGachaRepository(many(25));
      for (const limit of [0, -1, 2.5, Number.NaN]) {
        expect(await repo.listGacha({ limit }), String(limit)).toHaveLength(20);
      }
    });
  });

  describe("listPopularGacha", () => {
    it("라인업 수(itemCount) 가 많은 순으로 정렬한다", async () => {
      const repo = createMemoryGachaRepository([
        gacha("small", {}, 1),
        gacha("big", {}, 8),
        gacha("mid", {}, 4),
      ]);
      expect(ids(await repo.listPopularGacha())).toEqual(["big", "mid", "small"]);
    });

    it("items 배열이 아니라 itemCount 를 기준으로 하고, 모르면(null) 0 으로 본다", async () => {
      const repo = createMemoryGachaRepository([
        gacha("unknown", { itemCount: null }, 9),
        gacha("listed", { itemCount: 12 }, 0),
        gacha("few", { itemCount: 2 }, 5),
      ]);
      expect(ids(await repo.listPopularGacha())).toEqual(["listed", "few", "unknown"]);
    });

    it("라인업 수가 같으면 원래 순서를 유지한다 (안정 정렬)", async () => {
      const repo = createMemoryGachaRepository([
        gacha("t1", {}, 3),
        gacha("top", {}, 5),
        gacha("t2", {}, 3),
        gacha("t3", {}, 3),
      ]);
      expect(ids(await repo.listPopularGacha())).toEqual(["top", "t1", "t2", "t3"]);
    });

    it("limit 을 생략하면 기본 10개", async () => {
      const repo = createMemoryGachaRepository(many(15));
      expect(await repo.listPopularGacha()).toHaveLength(10);
    });

    it("limit 이 양의 정수가 아니면 기본 10개", async () => {
      const repo = createMemoryGachaRepository(many(15));
      for (const limit of [0, -1, 2.5, Number.NaN]) {
        expect(await repo.listPopularGacha(limit), String(limit)).toHaveLength(10);
      }
    });

    it("limit 만큼만 돌려준다", async () => {
      const repo = createMemoryGachaRepository([
        gacha("a", {}, 1),
        gacha("b", {}, 3),
        gacha("c", {}, 2),
      ]);
      expect(ids(await repo.listPopularGacha(2))).toEqual(["b", "c"]);
    });

    it("요약에는 items 필드가 없다", async () => {
      const repo = createMemoryGachaRepository([gacha("a", {}, 2)]);
      const [first] = await repo.listPopularGacha();
      expect(first).not.toHaveProperty("items");
    });

    it("정렬해도 listGacha 의 순서(최신순)는 바뀌지 않는다", async () => {
      const repo = createMemoryGachaRepository([gacha("a", {}, 1), gacha("b", {}, 5)]);
      await repo.listPopularGacha();
      expect(ids(await repo.listGacha())).toEqual(["a", "b"]);
    });
  });

  describe("listGachaByIds", () => {
    it("받은 id 순서대로 돌려준다 (seed 순서와 무관)", async () => {
      const repo = createMemoryGachaRepository([gacha("a"), gacha("b"), gacha("c")]);
      expect(ids(await repo.listGachaByIds(["c", "a"]))).toEqual(["c", "a"]);
    });

    it("없는 id 는 빼고 나머지 순서는 유지", async () => {
      const repo = createMemoryGachaRepository([gacha("a"), gacha("b")]);
      expect(ids(await repo.listGachaByIds(["b", "nope", "a"]))).toEqual(["b", "a"]);
    });

    it("빈 목록이면 빈 배열", async () => {
      const repo = createMemoryGachaRepository([gacha("a")]);
      expect(await repo.listGachaByIds([])).toEqual([]);
    });

    it("라인업 없이 요약만 돌려준다", async () => {
      const repo = createMemoryGachaRepository([gacha("a", {}, 2)]);
      const [found] = await repo.listGachaByIds(["a"]);
      expect(found).not.toHaveProperty("items");
    });
  });

  describe("getGacha", () => {
    it("id 가 맞는 가챠를 라인업까지 포함해 돌려준다", async () => {
      const repo = createMemoryGachaRepository([gacha("a"), gacha("b", {}, 2)]);
      const found = await repo.getGacha("b");
      expect(found?.id).toBe("b");
      expect(found?.items).toHaveLength(2);
    });

    it("없는 id 면 null", async () => {
      const repo = createMemoryGachaRepository([gacha("a")]);
      expect(await repo.getGacha("nope")).toBeNull();
    });
  });

  describe("searchGacha", () => {
    const seed: GachaDetail[] = [
      gacha("forest3", {
        name: "森のなかまマスコット Vol.3",
        nameKo: "숲속 친구들 마스코트 Vol.3",
        media: starry,
      }),
      gacha("cat", { name: "ねこカフェ ラバーストラップ", nameKo: "고양이 카페 러버 스트랩" }),
      gacha("plain", { name: "ふつうのガチャ", nameKo: null, media: noJaEn }),
    ];

    it("가챠 원문 이름(일본어) 부분 일치", async () => {
      const repo = createMemoryGachaRepository(seed);
      expect(ids((await repo.searchGacha({ keyword: "なかま" })).items)).toEqual(["forest3"]);
    });

    it("가챠 한국어 이름 부분 일치", async () => {
      const repo = createMemoryGachaRepository(seed);
      expect(ids((await repo.searchGacha({ keyword: "러버" })).items)).toEqual(["cat"]);
    });

    it("작품명 한국어 · 일본어 · 영어로도 찾는다", async () => {
      const repo = createMemoryGachaRepository(seed);
      for (const keyword of ["별의 숲", "星の森", "Starry Forest"]) {
        expect(ids((await repo.searchGacha({ keyword })).items), keyword).toEqual(["forest3"]);
      }
    });

    it("대소문자를 무시한다", async () => {
      const repo = createMemoryGachaRepository(seed);
      for (const keyword of ["vol.3", "VOL.3", "starry forest", "STARRY"]) {
        expect(ids((await repo.searchGacha({ keyword })).items), keyword).toEqual(["forest3"]);
      }
    });

    it("공백을 무시한다 (검색어 · 대상 양쪽)", async () => {
      const repo = createMemoryGachaRepository(seed);
      for (const keyword of [
        "숲속친구들",
        "숲 속 친 구 들",
        "  별의숲  ",
        "StarryForest",
        "vol .3",
      ]) {
        expect(ids((await repo.searchGacha({ keyword })).items), keyword).toEqual(["forest3"]);
      }
    });

    it("전각 문자를 반각과 같게 본다 (NFKC)", async () => {
      const repo = createMemoryGachaRepository(seed);
      // 검색어가 전각
      expect(ids((await repo.searchGacha({ keyword: "ｖｏｌ．３" })).items)).toEqual(["forest3"]);
      expect(ids((await repo.searchGacha({ keyword: "ＶＯＬ" })).items)).toEqual(["forest3"]);
      // 대상이 전각, 검색어가 반각
      const repo2 = createMemoryGachaRepository([gacha("fw", { name: "マスコット　ＶＯＬ．５" })]);
      expect(ids((await repo2.searchGacha({ keyword: "vol.5" })).items)).toEqual(["fw"]);
    });

    it("titleJa · titleEn 이 null 인 작품도 문제없이 검색한다", async () => {
      const repo = createMemoryGachaRepository(seed);
      expect(ids((await repo.searchGacha({ keyword: "평범한" })).items)).toEqual(["plain"]);
    });

    it("빈 검색어는 { items: [], total: 0 }", async () => {
      const repo = createMemoryGachaRepository(seed);
      expect(await repo.searchGacha({ keyword: "" })).toEqual({ items: [], total: 0 });
    });

    it("공백뿐인 검색어(전각 공백 포함)도 { items: [], total: 0 }", async () => {
      const repo = createMemoryGachaRepository(seed);
      for (const keyword of ["   ", "\t\n", "　"]) {
        expect(await repo.searchGacha({ keyword }), JSON.stringify(keyword)).toEqual({
          items: [],
          total: 0,
        });
      }
    });

    it("일치하는 게 없으면 { items: [], total: 0 }", async () => {
      const repo = createMemoryGachaRepository(seed);
      expect(await repo.searchGacha({ keyword: "존재하지않는가챠" })).toEqual({
        items: [],
        total: 0,
      });
    });

    it("결과 요약에는 items 필드가 없다", async () => {
      const repo = createMemoryGachaRepository([gacha("a", { name: "hit" }, 3)]);
      const { items } = await repo.searchGacha({ keyword: "hit" });
      expect(items).toHaveLength(1);
      expect(items[0]).not.toHaveProperty("items");
    });

    describe("페이지네이션", () => {
      const repo = createMemoryGachaRepository([
        ...many(7, { name: "マスコット" }),
        gacha("other", { name: "関係ない" }),
      ]);

      it("offset · limit 로 자르고 total 은 페이지와 무관한 전체 일치 개수", async () => {
        const page1 = await repo.searchGacha({ keyword: "マスコット", limit: 3, offset: 0 });
        const page2 = await repo.searchGacha({ keyword: "マスコット", limit: 3, offset: 3 });
        const page3 = await repo.searchGacha({ keyword: "マスコット", limit: 3, offset: 6 });
        expect(ids(page1.items)).toEqual(["g1", "g2", "g3"]);
        expect(ids(page2.items)).toEqual(["g4", "g5", "g6"]);
        expect(ids(page3.items)).toEqual(["g7"]);
        expect([page1.total, page2.total, page3.total]).toEqual([7, 7, 7]);
      });

      it("offset 이 전체를 넘으면 items 는 비고 total 은 그대로", async () => {
        expect(await repo.searchGacha({ keyword: "マスコット", limit: 3, offset: 100 })).toEqual({
          items: [],
          total: 7,
        });
      });

      it("limit · offset 을 생략하면 기본 20개 · 0부터", async () => {
        const big = createMemoryGachaRepository(many(25, { name: "マスコット" }));
        const page = await big.searchGacha({ keyword: "マスコット" });
        expect(page.items).toHaveLength(20);
        expect(page.items[0]?.id).toBe("g1");
        expect(page.total).toBe(25);
      });

      it("limit 이 양의 정수가 아니면 기본 20개", async () => {
        const big = createMemoryGachaRepository(many(25, { name: "マスコット" }));
        for (const limit of [0, -1, 2.5, Number.NaN]) {
          const page = await big.searchGacha({ keyword: "マスコット", limit });
          expect(page.items, String(limit)).toHaveLength(20);
          expect(page.total, String(limit)).toBe(25);
        }
      });

      it("offset 이 0 이상의 정수가 아니면 처음부터", async () => {
        for (const offset of [-1, -3, 1.5, Number.NaN]) {
          const page = await repo.searchGacha({ keyword: "マスコット", limit: 3, offset });
          expect(ids(page.items), String(offset)).toEqual(["g1", "g2", "g3"]);
        }
      });
    });

    describe("필터 · 정렬", () => {
      // 기준 달 2026-10 (기기 시간). 이름은 모두 "hit" 이라 검색어로는 걸러지지 않는다.
      const now = () => new Date(2026, 9, 15, 12);
      const other: Media = { ...starry, id: "m-other", title: "다른 작품" };
      const seed: GachaDetail[] = [
        gacha("sep", { name: "hit", releaseMonth: "2026-09", price: 500, media: starry }),
        gacha("oct", { name: "hit", releaseMonth: "2026-10", price: 300, media: starry }),
        gacha("nov", { name: "hit", releaseMonth: "2026-11", price: 400, media: other }),
        gacha("dec", { name: "hit", releaseMonth: "2027-01", price: null, media: starry }),
        gacha("unknown", { name: "hit", releaseMonth: null, price: 600, media: null }),
        gacha("oct2", { name: "hit", releaseMonth: "2026-10", price: 400, media: other }),
        gacha("miss", { name: "관계없음", releaseMonth: "2026-10", price: 300, media: null }),
      ];
      const repo = createMemoryGachaRepository(seed, { now });
      const search = (params: Omit<Parameters<typeof repo.searchGacha>[0], "keyword">) =>
        repo.searchGacha({ keyword: "hit", ...params });

      it("기본 정렬은 발매일순: 늦은 달부터, 발매월 모름은 맨 뒤, 같은 달은 원래 순서", async () => {
        const page = await search({});
        expect(ids(page.items)).toEqual(["dec", "nov", "oct", "oct2", "sep", "unknown"]);
        expect(page.total).toBe(6);
      });

      it("release: all 은 거르지 않는다", async () => {
        expect((await search({ filter: { release: "all" } })).total).toBe(6);
      });

      it("신상품(new) 은 이번 달 발매만", async () => {
        const page = await search({ filter: { release: "new" } });
        expect(ids(page.items)).toEqual(["oct", "oct2"]);
        expect(page.total).toBe(2);
      });

      it("발매 예정(upcoming) 은 다음 달 이후, 해가 바뀌어도", async () => {
        const page = await search({ filter: { release: "upcoming" } });
        expect(ids(page.items)).toEqual(["dec", "nov"]);
        expect(page.total).toBe(2);
      });

      it("기준 달은 호출할 때의 now 로 정한다", async () => {
        let current = new Date(2026, 9, 31, 23, 59);
        const moving = createMemoryGachaRepository(seed, { now: () => current });
        const newIds = async () =>
          ids((await moving.searchGacha({ keyword: "hit", filter: { release: "new" } })).items);
        expect(await newIds()).toEqual(["oct", "oct2"]);
        current = new Date(2026, 10, 1, 0, 0);
        expect(await newIds()).toEqual(["nov"]);
      });

      it("작품(mediaId) 으로 거른다. null 이면 거르지 않는다", async () => {
        expect(ids((await search({ filter: { mediaId: "m-other" } })).items)).toEqual([
          "nov",
          "oct2",
        ]);
        expect((await search({ filter: { mediaId: null } })).total).toBe(6);
      });

      it("가격 범위는 양 끝을 포함하고 가격 모름은 뺀다", async () => {
        const page = await search({ filter: { priceMin: 400, priceMax: 500 } });
        expect(ids(page.items)).toEqual(["nov", "oct2", "sep"]);
        expect(ids((await search({ filter: { priceMax: 300 } })).items)).toEqual(["oct"]);
        expect(ids((await search({ filter: { priceMin: 600 } })).items)).toEqual(["unknown"]);
      });

      it("가격이 유한한 숫자가 아니면 조건 없음", async () => {
        expect((await search({ filter: { priceMin: Number.NaN, priceMax: null } })).total).toBe(6);
      });

      it("필터를 여러 개 주면 모두 만족해야 한다 (AND)", async () => {
        const page = await search({
          filter: { release: "new", mediaId: "m-other", priceMax: 400 },
        });
        expect(ids(page.items)).toEqual(["oct2"]);
        expect(page.total).toBe(1);
        expect(
          await search({ filter: { release: "upcoming", mediaId: "m-other", priceMin: 500 } })
        ).toEqual({ items: [], total: 0 });
      });

      it("가격 낮은순 · 높은순, 가격 모름은 둘 다 맨 뒤", async () => {
        expect(ids((await search({ sort: "priceAsc" })).items)).toEqual([
          "oct",
          "nov",
          "oct2",
          "sep",
          "unknown",
          "dec",
        ]);
        expect(ids((await search({ sort: "priceDesc" })).items)).toEqual([
          "unknown",
          "sep",
          "nov",
          "oct2",
          "oct",
          "dec",
        ]);
      });

      it("필터 · 정렬을 적용한 뒤에 페이지를 자르고, total 은 필터 적용 개수", async () => {
        const page1 = await search({ filter: { priceMin: 300 }, sort: "priceAsc", limit: 2 });
        const page2 = await search({
          filter: { priceMin: 300 },
          sort: "priceAsc",
          limit: 2,
          offset: 2,
        });
        const page3 = await search({
          filter: { priceMin: 300 },
          sort: "priceAsc",
          limit: 2,
          offset: 4,
        });
        expect(ids(page1.items)).toEqual(["oct", "nov"]);
        expect(ids(page2.items)).toEqual(["oct2", "sep"]);
        expect(ids(page3.items)).toEqual(["unknown"]);
        expect([page1.total, page2.total, page3.total]).toEqual([5, 5, 5]);
      });

      it("모르는 정렬 값이 오면 발매일순", async () => {
        const page = await search({ sort: "nope" as never });
        expect(ids(page.items)).toEqual(["dec", "nov", "oct", "oct2", "sep", "unknown"]);
      });

      it("필터 · 정렬해도 seed 순서(listGacha) 는 바뀌지 않는다", async () => {
        await search({ sort: "priceDesc" });
        expect(ids(await repo.listGacha())).toEqual(ids(seed));
      });
    });
  });

  describe("seed 배열 격리", () => {
    it("저장소를 만든 뒤 seed 배열을 바꿔도 결과가 바뀌지 않는다", async () => {
      const seed = [gacha("a", { name: "hit" }, 1), gacha("b", { name: "hit" }, 2)];
      const repo = createMemoryGachaRepository(seed);

      seed.push(gacha("c", { name: "hit" }, 9));
      seed.splice(0, 1);
      seed.reverse();

      expect(ids(await repo.listGacha())).toEqual(["a", "b"]);
      expect(ids(await repo.listPopularGacha())).toEqual(["b", "a"]);
      expect(await repo.getGacha("c")).toBeNull();
      expect((await repo.searchGacha({ keyword: "hit" })).total).toBe(2);
    });
  });
});
