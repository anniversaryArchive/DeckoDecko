import { describe, expect, it } from "vitest";

import type { CatalogFile } from "./catalog.ts";
import { buildSql } from "./sql.ts";

const catalog: CatalogFile = {
  source: "https://gashapon.jp",
  collectedAt: "2026-10-29",
  entries: [
    {
      gachaId: 7,
      animeId: 3,
      animeTitle: "작품",
      name: "ねこ",
      nameKr: "고양이",
      sourceUrl: "https://gashapon.jp/products/detail.php?jan_code=1",
      releaseMonth: "2025-08",
      price: 400,
      items: [
        { name: "しろ", nameKr: "흰 고양이's", imageLink: "https://img/1_2.jpg" },
        { name: "くろ", nameKr: null, imageLink: "https://img/1_3.jpg" },
      ],
    },
  ],
};

describe("buildSql", () => {
  const sql = buildSql(catalog);

  it("발매월은 그 달 1일, 가격은 공식 값으로 바꾼다", () => {
    expect(sql).toContain(
      "update public.gacha set release_month = '2025-08-01', price = 400 where id = 7;"
    );
  });

  it("라인업을 지우고 순서대로 다시 넣는다 (작은따옴표 · null 처리)", () => {
    expect(sql).toContain("delete from public.gacha_items where gacha_id in (7);");
    expect(sql).toContain("(7, 'しろ', '흰 고양이''s', 'https://img/1_2.jpg', 0)");
    expect(sql).toContain("(7, 'くろ', null, 'https://img/1_3.jpg', 1)");
  });

  it("작품이 빠진 가챠가 있으면 되돌리는 검사를 넣고 트랜잭션으로 감싼다", () => {
    expect(sql).toContain("anime_id is not null) <> 1 then");
    expect(sql.indexOf("begin;")).toBeLessThan(sql.indexOf("commit;"));
  });
});
