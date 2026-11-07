import { describe, expect, it } from "vitest";

import { createSupabaseClient } from "../supabase";
import type { GachaRepositoryOptions, ResolvedGachaFilter } from "./gacha";
import { createSupabaseGachaRepository } from "./gacha.supabase";
import {
  toGacha,
  toGachaDetail,
  toGachaFromRpc,
  toMedia,
  toReleaseMonth,
} from "./gacha.supabase.mappers";
import { toSearchRpcArgs } from "./gacha.supabase.params";
import type {
  AnimeRow,
  GachaDetailRow,
  GachaRpcRow,
  GachaSearchRpcRow,
  GachaSummaryRow,
} from "./gacha.supabase.rows";

const forest: AnimeRow = {
  id: 1,
  kr_title: "별의 숲",
  jp_title: "星の森",
  en_title: "Forest of Stars",
  type: "anime",
};

function summaryRow(overrides: Partial<GachaSummaryRow> = {}): GachaSummaryRow {
  return {
    id: 3,
    name: "星の森 ミニフィギュア",
    name_kr: "별의 숲 미니 피규어",
    image_link: "https://example.com/g3.png",
    price: 500,
    release_month: "2026-10-01",
    anime: forest,
    gacha_items: [{ count: 5 }],
    ...overrides,
  };
}

/** RPC 의 평평한 행. summaryRow() 와 같은 가챠 · 작품이다. */
function popularRow(overrides: Partial<GachaRpcRow> = {}): GachaRpcRow {
  return {
    id: 3,
    name: "星の森 ミニフィギュア",
    name_kr: "별의 숲 미니 피규어",
    image_link: "https://example.com/g3.png",
    price: 500,
    release_month: "2026-10-01",
    anime_id: forest.id,
    anime_kr_title: forest.kr_title,
    anime_jp_title: forest.jp_title,
    anime_en_title: forest.en_title,
    anime_type: forest.type,
    item_count: 5,
    ...overrides,
  };
}

/** 검색 RPC 의 행. popularRow() 에 전체 개수가 붙는다. */
function searchRow(overrides: Partial<GachaSearchRpcRow> = {}): GachaSearchRpcRow {
  return { ...popularRow(), total_count: 1, ...overrides };
}

describe("행 → 도메인 매핑", () => {
  it("작품: id 는 문자열, 제목은 한 · 일 · 영, 이미지는 아직 없다", () => {
    expect(toMedia(forest)).toEqual({
      id: "1",
      title: "별의 숲",
      titleJa: "星の森",
      titleEn: "Forest of Stars",
      kind: "anime",
    });
  });

  it("작품 종류가 도메인에 없는 값이면 null", () => {
    expect(toMedia({ ...forest, type: "movie" }).kind).toBeNull();
    expect(toMedia({ ...forest, type: "game" }).kind).toBe("game");
  });

  it("발매 월은 그 달 1일 날짜에서 YYYY-MM 만 남긴다", () => {
    expect(toReleaseMonth("2026-10-01")).toBe("2026-10");
    expect(toReleaseMonth(null)).toBeNull();
    expect(toReleaseMonth("10월")).toBeNull();
  });

  it("가챠 요약: 컬럼 이름을 도메인 이름으로, 라인업 수는 embedded count 에서", () => {
    expect(toGacha(summaryRow())).toEqual({
      id: "3",
      name: "星の森 ミニフィギュア",
      nameKo: "별의 숲 미니 피규어",
      imageUrl: "https://example.com/g3.png",
      media: toMedia(forest),
      price: 500,
      releaseMonth: "2026-10",
      itemCount: 5,
    });
  });

  it("작품 · 라인업이 없으면 media null, itemCount 0", () => {
    const gacha = toGacha(summaryRow({ anime: null, gacha_items: [] }));
    expect(gacha.media).toBeNull();
    expect(gacha.itemCount).toBe(0);
  });

  it("RPC 행: 평평한 작품 칸을 묶어 select 로 받은 것과 같은 모양으로", () => {
    expect(toGachaFromRpc(popularRow())).toEqual(toGacha(summaryRow()));
  });

  it("RPC 행: 작품이 없으면(left join null) media null, 라인업 수가 없으면 0", () => {
    const gacha = toGachaFromRpc(
      popularRow({
        anime_id: null,
        anime_kr_title: null,
        anime_jp_title: null,
        anime_en_title: null,
        anime_type: null,
        item_count: null,
      })
    );
    expect(gacha.media).toBeNull();
    expect(gacha.itemCount).toBe(0);
  });

  it("원문 이름이 비면 한국어 이름, 둘 다 없으면 빈 문자열", () => {
    expect(toGacha(summaryRow({ name: null })).name).toBe("별의 숲 미니 피규어");
    expect(toGacha(summaryRow({ name: null, name_kr: null })).name).toBe("");
    expect(toGacha(summaryRow({ name: "" })).name).toBe("별의 숲 미니 피규어");
    expect(toGacha(summaryRow({ name: "  ", name_kr: "" })).name).toBe("");
  });

  it("상세: 라인업을 sort_order → id 순으로 세우고 1부터 번호를 매긴다", () => {
    const row: GachaDetailRow = {
      ...summaryRow(),
      gacha_items: [
        { id: 12, gacha_id: 3, name: "B", name_kr: null, image_link: null, sort_order: 2 },
        { id: 11, gacha_id: 3, name: "A", name_kr: "에이", image_link: "a.png", sort_order: 1 },
        { id: 14, gacha_id: 3, name: "D", name_kr: null, image_link: null, sort_order: 2 },
      ],
    };
    const detail = toGachaDetail(row);
    expect(detail.itemCount).toBe(3);
    expect(detail.items).toEqual([
      { id: "11", gachaId: "3", number: 1, name: "A", nameKo: "에이", imageUrl: "a.png" },
      { id: "12", gachaId: "3", number: 2, name: "B", nameKo: null, imageUrl: null },
      { id: "14", gachaId: "3", number: 3, name: "D", nameKo: null, imageUrl: null },
    ]);
    // 입력 배열은 건드리지 않는다
    expect(row.gacha_items.map((i) => i.id)).toEqual([12, 11, 14]);
  });
});

describe("toSearchRpcArgs", () => {
  const none: ResolvedGachaFilter = {
    release: "all",
    mediaId: null,
    priceMin: null,
    priceMax: null,
  };
  const base = { keyword: "숲", limit: 10, offset: 20, filter: none, sort: undefined };

  it("조건이 없으면 검색어 · 페이지 · 이번 달 1일 · 기본 정렬만 넣는다", () => {
    expect(toSearchRpcArgs({ ...base, thisMonth: "2026-10" })).toEqual({
      keyword: "숲",
      limit_count: 10,
      offset_count: 20,
      this_month: "2026-10-01",
      sort_by: "release",
    });
  });

  it("필터 · 정렬을 RPC 인자 이름으로 옮긴다 (작품 id 는 DB id, 0 엔도 조건)", () => {
    expect(
      toSearchRpcArgs({
        ...base,
        filter: { release: "upcoming", mediaId: "7", priceMin: 0, priceMax: 500 },
        sort: "priceDesc",
        thisMonth: "2026-12",
      })
    ).toEqual({
      keyword: "숲",
      limit_count: 10,
      offset_count: 20,
      this_month: "2026-12-01",
      sort_by: "priceDesc",
      release_filter: "upcoming",
      anime_filter: 7,
      price_min: 0,
      price_max: 500,
    });
  });

  it("숫자가 아닌 작품 id 는 맞을 수 없는 조건이라 null", () => {
    expect(
      toSearchRpcArgs({ ...base, filter: { ...none, mediaId: "m1" }, thisMonth: "2026-10" })
    ).toBeNull();
    expect(
      toSearchRpcArgs({ ...base, filter: { ...none, mediaId: "007" }, thisMonth: "2026-10" })
    ).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 저장소: fetch 를 바꿔 끼워 요청 · 응답 처리만 본다 (실제 Supabase 에 붙지 않는다)
// ─────────────────────────────────────────────

type Reply = { status?: number; body: unknown; headers?: Record<string, string> };

function fakeRepository(
  reply: (url: URL) => Reply | Promise<Reply>,
  options?: GachaRepositoryOptions
) {
  const requests: URL[] = [];
  const bodies: unknown[] = [];
  const fakeFetch: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    requests.push(url);
    bodies.push(init?.body ? JSON.parse(String(init.body)) : null);
    const { status = 200, body, headers = {} } = await reply(url);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", ...headers },
    });
  };
  const client = createSupabaseClient("http://localhost:54321", "sb_publishable_test", {
    fetch: fakeFetch,
  });
  return { repo: createSupabaseGachaRepository(client, options), requests, bodies };
}

describe("createSupabaseGachaRepository", () => {
  it("목록: 최신순으로 limit 만큼 요청하고 도메인 타입으로 돌려준다", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [summaryRow()] }));
    const list = await repo.listGacha({ limit: 5 });
    expect(list).toEqual([toGacha(summaryRow())]);
    const params = requests[0]!.searchParams;
    expect(params.get("order")).toBe("created_at.desc.nullslast,id.desc");
    expect(params.get("limit")).toBe("5");
  });

  it("목록: limit 을 빼거나 잘못 주면 기본값", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [] }));
    await repo.listGacha();
    await repo.listGacha({ limit: 0 });
    await repo.listGacha({ limit: 2.5 });
    expect(requests.map((r) => r.searchParams.get("limit"))).toEqual(["20", "20", "20"]);
  });

  it("인기: RPC get_top_gacha_views 에 limit 을 넘기고, 기본 10개", async () => {
    const bodies: unknown[] = [];
    const urls: string[] = [];
    const fakeFetch: typeof fetch = async (input, init) => {
      urls.push(input instanceof Request ? input.url : String(input));
      bodies.push(JSON.parse(String(init?.body ?? "null")));
      return new Response(JSON.stringify([popularRow()]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const client = createSupabaseClient("http://localhost:54321", "sb_publishable_test", {
      fetch: fakeFetch,
    });
    const repo = createSupabaseGachaRepository(client);

    await expect(repo.listPopularGacha(3)).resolves.toEqual([toGachaFromRpc(popularRow())]);
    await repo.listPopularGacha();
    await repo.listPopularGacha(0);
    expect(new URL(urls[0]!).pathname).toBe("/rest/v1/rpc/get_top_gacha_views");
    expect(bodies).toEqual([{ limit_count: 3 }, { limit_count: 10 }, { limit_count: 10 }]);
  });

  it("인기: 실패는 throw", async () => {
    const { repo } = fakeRepository(() => ({
      status: 500,
      body: { message: "boom", code: "XX000", details: null, hint: null },
    }));
    await expect(repo.listPopularGacha()).rejects.toThrow("[gacha.listPopularGacha] boom");
  });

  it("상세: 라인업까지 받아 도메인 타입으로", async () => {
    const row: GachaDetailRow = {
      ...summaryRow(),
      gacha_items: [
        { id: 11, gacha_id: 3, name: "A", name_kr: null, image_link: null, sort_order: 0 },
      ],
    };
    const { repo, requests } = fakeRepository(() => ({ body: row }));
    await expect(repo.getGacha("3")).resolves.toEqual(toGachaDetail(row));
    expect(requests[0]!.searchParams.get("select")).toContain("gacha_items(id,");
  });

  it("빈 결과는 빈 배열, 실패는 throw (React Query error 상태로)", async () => {
    const empty = fakeRepository(() => ({ body: [] }));
    await expect(empty.repo.listGacha()).resolves.toEqual([]);

    const broken = fakeRepository(() => ({
      status: 500,
      body: { message: "boom", code: "XX000", details: null, hint: null },
    }));
    await expect(broken.repo.listGacha()).rejects.toThrow("[gacha.listGacha] boom");
    await expect(broken.repo.listPopularGacha()).rejects.toThrow(Error);
    await expect(broken.repo.getGacha("1")).rejects.toThrow(Error);
  });

  it("네트워크가 끊겨도 throw", async () => {
    const { repo } = fakeRepository(() => {
      throw new TypeError("Network request failed");
    });
    await expect(repo.listGacha()).rejects.toThrow(Error);
  });

  it("상세: 없으면 null, 숫자가 아닌 id 는 요청하지 않고 null", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [] }));
    await expect(repo.getGacha("999")).resolves.toBeNull();
    await expect(repo.getGacha("m-1")).resolves.toBeNull();
    await expect(repo.getGacha("007")).resolves.toBeNull();
    await expect(repo.getGacha("")).resolves.toBeNull();
    expect(requests).toHaveLength(1);
    expect(requests[0]!.searchParams.get("id")).toBe("eq.999");
  });

  it("상세: 안전한 정수를 넘는 id 는 요청하지 않고 null", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [] }));
    await expect(repo.getGacha("99999999999999999999")).resolves.toBeNull();
    expect(requests).toHaveLength(0);
  });

  it("id 로 여러 개: 한 번에 요청하고 받은 id 순서대로, 없는 id 는 뺀다", async () => {
    const rows = [summaryRow({ id: 3 }), summaryRow({ id: 7 })];
    const { repo, requests } = fakeRepository(() => ({ body: rows }));
    const list = await repo.listGachaByIds(["7", "999", "3"]);
    expect(list.map((g) => g.id)).toEqual(["7", "3"]);
    expect(requests).toHaveLength(1);
    expect(requests[0]!.searchParams.get("id")).toBe("in.(7,999,3)");
  });

  it("id 로 여러 개: 숫자가 아닌 id 는 요청에서 빼고, 남는 게 없으면 요청하지 않는다", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [] }));
    await expect(repo.listGachaByIds([])).resolves.toEqual([]);
    await expect(repo.listGachaByIds(["m-1", "007"])).resolves.toEqual([]);
    expect(requests).toHaveLength(0);
    await repo.listGachaByIds(["m-1", "5"]);
    expect(requests[0]!.searchParams.get("id")).toBe("in.(5)");
  });

  it("id 로 여러 개: 실패는 throw", async () => {
    const { repo } = fakeRepository(() => ({
      status: 500,
      body: { message: "boom", code: "XX000", details: null, hint: null },
    }));
    await expect(repo.listGachaByIds(["1"])).rejects.toThrow("[gacha.listGachaByIds] boom");
  });

  describe("검색: RPC search_gacha_with_anime", () => {
    const october = () => new Date(2026, 9, 23);
    const boom = {
      status: 500,
      body: { message: "boom", code: "XX000", details: null, hint: null },
    };

    it("빈 검색어는 요청하지 않는다", async () => {
      const { repo, requests } = fakeRepository(() => ({ body: [] }));
      await expect(repo.searchGacha({ keyword: "   " })).resolves.toEqual({ items: [], total: 0 });
      expect(requests).toHaveLength(0);
    });

    it("검색어 · 페이지 · 이번 달을 넘기고, 행은 도메인 타입 · 전체 개수는 total_count 로", async () => {
      const { repo, requests, bodies } = fakeRepository(
        () => ({ body: [searchRow({ total_count: 21 })] }),
        { now: october }
      );
      const page = await repo.searchGacha({ keyword: " ＦＯＲＥＳＴ ", offset: 20, limit: 10 });
      expect(page).toEqual({ items: [toGachaFromRpc(searchRow())], total: 21 });
      expect(requests).toHaveLength(1);
      expect(requests[0]!.pathname).toBe("/rest/v1/rpc/search_gacha_with_anime");
      // 전각은 NFKC 로 반각, 앞뒤 공백은 지운다 (나머지 정규화는 RPC 가 한다)
      expect(bodies[0]).toEqual({
        keyword: "FOREST",
        limit_count: 10,
        offset_count: 20,
        this_month: "2026-10-01",
        sort_by: "release",
      });
    });

    it("필터 · 정렬을 RPC 인자로 넘긴다. 기준 달은 now 로 정한다", async () => {
      const { repo, bodies } = fakeRepository(() => ({ body: [searchRow()] }), {
        now: () => new Date(2026, 11, 31, 23, 59),
      });
      await repo.searchGacha({
        keyword: "숲",
        filter: { release: "new", mediaId: "1", priceMin: 400, priceMax: 500 },
        sort: "priceAsc",
      });
      expect(bodies[0]).toMatchObject({
        this_month: "2026-12-01",
        release_filter: "new",
        anime_filter: 1,
        price_min: 400,
        price_max: 500,
        sort_by: "priceAsc",
      });
    });

    it("숫자가 아닌 작품 id 면 요청하지 않고 빈 결과", async () => {
      const { repo, requests } = fakeRepository(() => ({ body: [searchRow()] }));
      await expect(repo.searchGacha({ keyword: "숲", filter: { mediaId: "m1" } })).resolves.toEqual(
        { items: [], total: 0 }
      );
      expect(requests).toHaveLength(0);
    });

    it("offset · limit 을 잘못 주면 기본값(0, 20), limit 은 100 까지", async () => {
      const { repo, bodies } = fakeRepository(() => ({ body: [] }));
      await repo.searchGacha({ keyword: "숲", offset: -1, limit: 0 });
      await repo.searchGacha({ keyword: "숲", limit: 150 });
      expect(bodies).toMatchObject([
        { limit_count: 20, offset_count: 0 },
        { limit_count: 100, offset_count: 0 },
      ]);
    });

    it("첫 페이지가 비면 결과 없음 (다시 세지 않는다)", async () => {
      const { repo, requests } = fakeRepository(() => ({ body: [] }));
      await expect(repo.searchGacha({ keyword: "없음" })).resolves.toEqual({ items: [], total: 0 });
      expect(requests).toHaveLength(1);
    });

    it("마지막 페이지 너머(빈 행)는 같은 조건으로 첫 행만 다시 받아 전체 개수를 센다", async () => {
      let calls = 0;
      const { repo, bodies } = fakeRepository(
        () => ({ body: calls++ === 0 ? [] : [searchRow({ total_count: 3 })] }),
        { now: october }
      );
      await expect(
        repo.searchGacha({
          keyword: "숲",
          offset: 40,
          filter: { release: "upcoming", priceMax: 300 },
        })
      ).resolves.toEqual({ items: [], total: 3 });
      expect(bodies).toHaveLength(2);
      expect(bodies[1]).toEqual({
        ...(bodies[0] as object),
        limit_count: 1,
        offset_count: 0,
      });
      expect(bodies[1]).toMatchObject({ release_filter: "upcoming", price_max: 300 });
    });

    it("마지막 페이지 너머에서 다시 세도 비어 있으면 전체 0", async () => {
      const { repo, requests } = fakeRepository(() => ({ body: [] }));
      await expect(repo.searchGacha({ keyword: "숲", offset: 40 })).resolves.toEqual({
        items: [],
        total: 0,
      });
      expect(requests).toHaveLength(2);
    });

    it("total_count 가 비어 오면 받은 행 수를 전체로 본다", async () => {
      const { repo } = fakeRepository(() => ({
        body: [searchRow({ total_count: null }), searchRow({ id: 4, total_count: null })],
      }));
      await expect(repo.searchGacha({ keyword: "숲" })).resolves.toMatchObject({ total: 2 });
    });

    it("검색 · 개수 다시 세기 중 하나라도 실패하면 throw", async () => {
      const searchFails = fakeRepository(() => boom);
      await expect(searchFails.repo.searchGacha({ keyword: "숲" })).rejects.toThrow(
        "[gacha.searchGacha] boom"
      );

      let calls = 0;
      const headFails = fakeRepository(() => (calls++ === 0 ? { body: [] } : boom));
      await expect(headFails.repo.searchGacha({ keyword: "숲", offset: 40 })).rejects.toThrow(
        "[gacha.searchGacha.count] boom"
      );
    });
  });
});

describe("createSupabaseClient", () => {
  it.each([
    ["secret key", "sb_secret_xxx"],
    ["legacy service_role · anon (JWT)", "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.x"],
    ["빈 값", ""],
  ])("publishable key 가 아니면 만들지 않는다: %s", (_kind, key) => {
    expect(() => createSupabaseClient("http://localhost:54321", key)).toThrow("publishable key");
  });
});
