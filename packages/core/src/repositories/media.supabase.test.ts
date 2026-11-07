import { describe, expect, it } from "vitest";

import { createSupabaseClient } from "../supabase";
import { createSupabaseMediaRepository } from "./media.supabase";

// fetch 를 바꿔 끼워 요청 · 응답 처리만 본다 (실제 Supabase 에 붙지 않는다)

type AnimeRowWithAliases = {
  id: number;
  kr_title: string;
  jp_title: string | null;
  en_title: string | null;
  type: string;
  aliases: string[];
};

function row(id: number, title: string, aliases: string[] = []): AnimeRowWithAliases {
  return { id, kr_title: title, jp_title: null, en_title: null, type: "anime", aliases };
}

function fakeRepository(reply: (url: URL) => { status?: number; body: unknown }) {
  const requests: URL[] = [];
  const fakeFetch: typeof fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    requests.push(url);
    const { status = 200, body } = reply(url);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  };
  const client = createSupabaseClient("http://localhost:54321", "sb_publishable_test", {
    fetch: fakeFetch,
  });
  return { repo: createSupabaseMediaRepository(client), requests };
}

describe("createSupabaseMediaRepository", () => {
  it("anime 테이블에서 별칭까지 받아 작품으로 바꾼다", async () => {
    const { repo, requests } = fakeRepository((url) =>
      Number(url.searchParams.get("offset")) > 0
        ? { body: [] }
        : { body: [row(1, "별의 숲", ["별숲"])] }
    );

    expect(await repo.listMedia()).toEqual([
      { id: "1", title: "별의 숲", titleJa: null, titleEn: null, kind: "anime", aliases: ["별숲"] },
    ]);
    expect(requests[0]!.pathname).toBe("/rest/v1/anime");
    expect(requests[0]!.searchParams.get("select")).toContain("aliases");
    expect(requests[0]!.searchParams.get("order")).toBe("id.asc");
  });

  it("빈 페이지가 올 때까지 받은 개수만큼 넘겨 받는다 (서버 max_rows 가 요청보다 작아도 잘리지 않는다)", async () => {
    // 서버가 한 번에 2행씩만 준다고 본다
    const all = Array.from({ length: 5 }, (_, i) => row(i + 1, `작품 ${i + 1}`));
    const { repo, requests } = fakeRepository((url) => {
      const offset = Number(url.searchParams.get("offset") ?? 0);
      return { body: all.slice(offset, offset + 2) };
    });

    expect((await repo.listMedia()).map((m) => m.id)).toEqual(["1", "2", "3", "4", "5"]);
    expect(requests.map((r) => r.searchParams.get("offset") ?? "0")).toEqual(["0", "2", "4", "5"]);
  });

  it("받기에 실패하면 던진다", async () => {
    const { repo } = fakeRepository(() => ({ status: 500, body: { message: "boom" } }));
    await expect(repo.listMedia()).rejects.toThrow("[media.listMedia] boom");
  });
});
