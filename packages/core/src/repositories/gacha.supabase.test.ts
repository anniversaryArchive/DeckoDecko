import { describe, expect, it } from "vitest";

import { createSupabaseClient } from "../supabase";
import { createSupabaseGachaRepository } from "./gacha.supabase";
import { toGacha, toGachaDetail, toMedia, toReleaseMonth } from "./gacha.supabase.mappers";
import { toIlikeValue } from "./gacha.supabase.params";
import type { AnimeRow, GachaDetailRow, GachaSummaryRow } from "./gacha.supabase.rows";

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

  it("원문 이름이 비면 한국어 이름, 둘 다 없으면 빈 문자열", () => {
    expect(toGacha(summaryRow({ name: null })).name).toBe("별의 숲 미니 피규어");
    expect(toGacha(summaryRow({ name: null, name_kr: null })).name).toBe("");
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

describe("toIlikeValue", () => {
  it("부분 일치 패턴을 큰따옴표로 감싼다", () => {
    expect(toIlikeValue("별의 숲")).toBe('"%별의 숲%"');
  });

  it("LIKE 와일드카드와 or() 문법 글자를 글자 그대로 찾게 한다", () => {
    expect(toIlikeValue("100%")).toBe('"%100\\\\%%"');
    expect(toIlikeValue("a_b")).toBe('"%a\\\\_b%"');
    expect(toIlikeValue('say "hi", (ok).')).toBe('"%say \\"hi\\", (ok).%"');
  });

  it("* 는 PostgREST 가 % 로 바꾸므로 아무 한 글자(_)로 찾는다", () => {
    expect(toIlikeValue("*")).toBe('"%_%"');
    expect(toIlikeValue("a*b")).toBe('"%a_b%"');
  });
});

// ─────────────────────────────────────────────
// 저장소: fetch 를 바꿔 끼워 요청 · 응답 처리만 본다 (실제 Supabase 에 붙지 않는다)
// ─────────────────────────────────────────────

type Reply = { status?: number; body: unknown; headers?: Record<string, string> };

function fakeRepository(reply: (url: URL) => Reply | Promise<Reply>) {
  const requests: URL[] = [];
  const fakeFetch: typeof fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    requests.push(url);
    const { status = 200, body, headers = {} } = await reply(url);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", ...headers },
    });
  };
  const client = createSupabaseClient("http://localhost:54321", "sb_publishable_test", {
    fetch: fakeFetch,
  });
  return { repo: createSupabaseGachaRepository(client), requests };
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

  it("인기: id 오름차순(임시)으로 limit 만큼, 기본 10개", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [summaryRow()] }));
    await expect(repo.listPopularGacha(3)).resolves.toEqual([toGacha(summaryRow())]);
    await repo.listPopularGacha();
    expect(requests[0]!.searchParams.get("order")).toBe("id.asc");
    expect(requests[0]!.searchParams.get("limit")).toBe("3");
    expect(requests[1]!.searchParams.get("limit")).toBe("10");
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

  it("검색: 빈 검색어는 요청하지 않는다", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [] }));
    await expect(repo.searchGacha({ keyword: "   " })).resolves.toEqual({ items: [], total: 0 });
    expect(requests).toHaveLength(0);
  });

  it("검색: 작품명이 맞는 작품 id 를 먼저 받고, 이름 ilike 와 묶어 개수와 함께 받는다", async () => {
    const { repo, requests } = fakeRepository((url) =>
      url.pathname.endsWith("/anime")
        ? { body: [{ id: 1 }, { id: 4 }] }
        : { body: [summaryRow()], headers: { "content-range": "20-20/21" } }
    );
    const page = await repo.searchGacha({ keyword: "숲", offset: 20, limit: 10 });
    expect(page).toEqual({ items: [toGacha(summaryRow())], total: 21 });

    const [anime, gacha] = requests;
    expect(anime!.searchParams.get("or")).toBe(
      '(kr_title.ilike."%숲%",jp_title.ilike."%숲%",en_title.ilike."%숲%")'
    );
    expect(gacha!.searchParams.get("or")).toBe(
      '(name.ilike."%숲%",name_kr.ilike."%숲%",anime_id.in.(1,4))'
    );
    expect(gacha!.searchParams.get("offset")).toBe("20");
    expect(gacha!.searchParams.get("limit")).toBe("10");
  });

  it("검색: 맞는 작품이 없으면 이름으로만 찾는다", async () => {
    const { repo, requests } = fakeRepository((url) =>
      url.pathname.endsWith("/anime")
        ? { body: [] }
        : { body: [], headers: { "content-range": "*/0" } }
    );
    await expect(repo.searchGacha({ keyword: "없음" })).resolves.toEqual({ items: [], total: 0 });
    expect(requests[1]!.searchParams.get("or")).toBe(
      '(name.ilike."%없음%",name_kr.ilike."%없음%")'
    );
  });

  it("검색: 마지막 페이지 너머(416)는 에러가 아니라 빈 페이지 + 전체 개수", async () => {
    const { repo } = fakeRepository((url) => {
      if (url.pathname.endsWith("/anime")) return { body: [] };
      return url.searchParams.has("offset")
        ? { status: 416, body: { code: "PGRST103", message: "Requested range not satisfiable" } }
        : { body: [], headers: { "content-range": "*/3" } };
    });
    await expect(repo.searchGacha({ keyword: "숲", offset: 40 })).resolves.toEqual({
      items: [],
      total: 3,
    });
  });

  it("검색: 마지막 페이지 너머에서 개수 헤더도 없으면 전체 0", async () => {
    const { repo } = fakeRepository((url) => {
      if (url.pathname.endsWith("/anime")) return { body: [] };
      return url.searchParams.has("offset")
        ? { status: 416, body: { code: "PGRST103", message: "Requested range not satisfiable" } }
        : { body: [] };
    });
    await expect(repo.searchGacha({ keyword: "숲", offset: 40 })).resolves.toEqual({
      items: [],
      total: 0,
    });
  });

  it("검색: offset · limit 을 잘못 주면 기본값(0, 20)", async () => {
    const { repo, requests } = fakeRepository(() => ({ body: [] }));
    await repo.searchGacha({ keyword: "숲", offset: -1, limit: 0 });
    expect(requests[1]!.searchParams.get("offset")).toBe("0");
    expect(requests[1]!.searchParams.get("limit")).toBe("20");
  });

  it("검색: 개수 헤더가 없으면 받은 개수를 전체로 본다", async () => {
    const { repo } = fakeRepository((url) =>
      url.pathname.endsWith("/anime") ? { body: [] } : { body: [summaryRow(), summaryRow()] }
    );
    const page = await repo.searchGacha({ keyword: "숲" });
    expect(page.total).toBe(2);
  });

  it("검색: 작품 조회 · 본 검색 · 개수 조회 중 하나라도 실패하면 throw", async () => {
    const boom = { status: 500, body: { message: "boom", code: "XX000" } };

    const animeFails = fakeRepository(() => boom);
    await expect(animeFails.repo.searchGacha({ keyword: "숲" })).rejects.toThrow(
      "[gacha.searchGacha] boom"
    );
    expect(animeFails.requests).toHaveLength(1);

    const searchFails = fakeRepository((url) =>
      url.pathname.endsWith("/anime") ? { body: [] } : boom
    );
    await expect(searchFails.repo.searchGacha({ keyword: "숲" })).rejects.toThrow(
      "[gacha.searchGacha] boom"
    );

    const headFails = fakeRepository((url) => {
      if (url.pathname.endsWith("/anime")) return { body: [] };
      return url.searchParams.has("offset")
        ? { status: 416, body: { code: "PGRST103", message: "Requested range not satisfiable" } }
        : boom;
    });
    await expect(headFails.repo.searchGacha({ keyword: "숲", offset: 40 })).rejects.toThrow(Error);
  });
});

describe("createSupabaseClient", () => {
  it("secret key 를 넘기면 만들지 않는다", () => {
    expect(() => createSupabaseClient("http://localhost:54321", "sb_secret_xxx")).toThrow();
  });
});
