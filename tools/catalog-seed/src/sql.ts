import type { CatalogFile } from "./catalog.ts";

function literal(value: string | number | null): string {
  if (value === null) return "null";
  if (typeof value === "number") return String(value);
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * 레거시 gacha 를 보강하는 SQL. 여러 번 실행해도 결과가 같다
 * (라인업은 지우고 다시 넣는다). 대상 가챠에 작품이 빠져 있으면 전체를 되돌린다.
 */
export function buildSql(catalog: CatalogFile): string {
  // 비어 있으면 `in ()` · 빈 values 가 나와 SQL 문법 오류가 된다
  if (catalog.entries.length === 0) throw new Error("대상 가챠가 없다");
  const empty = catalog.entries.find((entry) => entry.items.length === 0);
  if (empty) throw new Error(`라인업이 빈 가챠 #${empty.gachaId}`);
  const ids = catalog.entries.map((entry) => entry.gachaId);
  const idList = ids.join(", ");
  const lines: string[] = [
    "-- 생성 파일: 손으로 고치지 않는다. tools/catalog-seed 의 README 순서대로 다시 만든다.",
    `-- 출처 ${catalog.source} · 수집 ${catalog.collectedAt} · 가챠 ${ids.length}개`,
    "begin;",
    "",
    "do $$",
    "begin",
    `  if (select count(*) from public.gacha where id in (${idList}) and anime_id is not null) <> ${ids.length} then`,
    "    raise exception '대상 가챠가 없거나 작품(anime_id)이 빠져 있다';",
    "  end if;",
    "end $$;",
    "",
  ];

  for (const entry of catalog.entries) {
    lines.push(
      `update public.gacha set release_month = ${literal(`${entry.releaseMonth}-01`)}, price = ${entry.price} where id = ${entry.gachaId};`
    );
  }

  lines.push("", `delete from public.gacha_items where gacha_id in (${idList});`, "");
  lines.push(
    "insert into public.gacha_items (gacha_id, name, name_kr, image_link, sort_order) values"
  );
  const rows = catalog.entries.flatMap((entry) =>
    entry.items.map(
      (item, index) =>
        `  (${entry.gachaId}, ${literal(item.name)}, ${literal(item.nameKr)}, ${literal(item.imageLink)}, ${index})`
    )
  );
  lines.push(`${rows.join(",\n")};`, "", "commit;", "");
  return lines.join("\n");
}
