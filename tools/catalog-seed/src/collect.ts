import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { parseArgs } from "node:util";

import { type CatalogEntry, writeCatalog } from "./catalog.ts";
import {
  GASHAPON_ORIGIN,
  type ScheduleCard,
  detailUrl,
  modelIdFromImageLink,
  parseDetail,
  parseSchedule,
  scheduleUrl,
} from "./gashapon.ts";

interface LegacyGacha {
  id: number;
  anime_id: number;
  anime_title: string;
  name: string;
  name_kr: string | null;
  image_link: string;
}

const { values: args } = parseArgs({
  options: {
    count: { type: "string", default: "60" },
    from: { type: "string", default: "202501" },
    to: { type: "string", default: "202511" },
    "project-ref": { type: "string", default: "mdlgzwgxvvncejtpdfmq" },
  },
});
const target = Number(args.count);
if (!Number.isInteger(target) || target <= 0)
  throw new Error(`--count 는 양의 정수: ${args.count}`);
for (const ym of [args.from, args.to]) {
  if (!/^\d{4}(0[1-9]|1[0-2])$/.test(ym)) throw new Error(`--from · --to 는 YYYYMM: ${ym}`);
}
// 공식 사이트에 부담을 주지 않도록 요청 사이를 띄운다
const REQUEST_GAP_MS = 1000;
const REQUEST_TIMEOUT_MS = 15_000;
// 작품이 아닌 레거시 anime 행: 여러 작품이 섞여 붙은 행("몬스터" · "X" · "러프"), 깨진 행, 브랜드
const EXCLUDED_ANIME_IDS = new Set([374, 1179, 285, 1262, 1192, 1362, 1242, 1290]);

/** anime 테이블에 같은 작품이 여러 행으로 들어 있어 id 대신 이름으로도 겹침을 막는다. */
function titleKey(title: string): string {
  return title.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}

function months(from: string, to: string): string[] {
  const result: string[] = [];
  let year = Number(from.slice(0, 4));
  let month = Number(from.slice(4));
  while (`${year}${String(month).padStart(2, "0")}` <= to) {
    result.push(`${year}${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

async function fetchHtml(url: string): Promise<string> {
  await sleep(REQUEST_GAP_MS);
  const response = await fetch(url, {
    headers: { "user-agent": "DeckoDecko catalog-seed" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function loadLegacy(projectRef: string): LegacyGacha[] {
  const sql = `select g.id, g.anime_id, coalesce(a.kr_title, a.jp_title) as anime_title,
      g.name, g.name_kr, g.image_link
    from public.gacha g join public.anime a on a.id = g.anime_id
    where g.image_link is not null order by g.id`;
  // Management API 를 거치므로 supabase login 만 되어 있으면 된다 (link · DB 비밀번호 불필요)
  // 기본 출력은 text 표라서 JSON 을 명시한다 (AI 에이전트 안에서만 JSON 이 기본이다)
  const out = execFileSync(
    "pnpm",
    [
      "exec",
      "supabase",
      "db",
      "query",
      "--linked",
      "--project-ref",
      projectRef,
      "--output-format",
      "json",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
  );
  return (JSON.parse(out) as { rows: LegacyGacha[] }).rows;
}

async function main(): Promise<void> {
  const legacy = loadLegacy(args["project-ref"]);
  console.log(`레거시 가챠(작품 연결됨) ${legacy.length}개`);

  // 같은 상품이 재입고로 여러 달에 나오면 가장 최근 달을 쓴다
  const cards = new Map<string, ScheduleCard & { ym: string }>();
  for (const ym of months(args.from, args.to)) {
    for (const card of parseSchedule(await fetchHtml(scheduleUrl(ym)))) {
      cards.set(card.modelId, { ...card, ym });
    }
    console.log(`일정 ${ym} 읽음 (누적 상품 ${cards.size}개)`);
  }

  const candidates = legacy
    .map((gacha) => ({ gacha, card: cards.get(modelIdFromImageLink(gacha.image_link) ?? "") }))
    .filter((c): c is { gacha: LegacyGacha; card: ScheduleCard & { ym: string } } => !!c.card)
    .sort((a, b) => b.card.ym.localeCompare(a.card.ym) || b.gacha.id - a.gacha.id);
  console.log(`일정 페이지와 짝지은 가챠 ${candidates.length}개`);

  // 작품 칩이 고르게 보이도록 작품당 하나씩 고른다
  const entries: CatalogEntry[] = [];
  const usedAnime = new Set<number>();
  const usedTitles = new Set<string>();
  for (const { gacha, card } of candidates) {
    if (entries.length >= target) break;
    if (EXCLUDED_ANIME_IDS.has(gacha.anime_id)) continue;
    if (usedAnime.has(gacha.anime_id) || usedTitles.has(titleKey(gacha.anime_title))) continue;
    const url = detailUrl(card.janCode);
    try {
      const detail = parseDetail(await fetchHtml(url));
      if (detail.items.length !== detail.itemCount) {
        throw new Error(`라인업 ${detail.items.length}개 ≠ 全${detail.itemCount}種`);
      }
      // 재판매 상품은 상세 페이지가 다음 판매 달을 보여 줘서 처음 발매월을 알 수 없다
      const scheduleMonth = `${card.ym.slice(0, 4)}-${card.ym.slice(4)}`;
      if (detail.releaseMonth !== scheduleMonth) {
        throw new Error(`발매월 ${detail.releaseMonth} ≠ 일정 ${scheduleMonth} (재판매)`);
      }
      entries.push({
        gachaId: gacha.id,
        animeId: gacha.anime_id,
        animeTitle: gacha.anime_title,
        name: gacha.name,
        nameKr: gacha.name_kr,
        sourceUrl: url,
        releaseMonth: detail.releaseMonth,
        price: detail.price,
        items: detail.items.map((item) => ({ ...item, nameKr: null })),
      });
      usedAnime.add(gacha.anime_id);
      usedTitles.add(titleKey(gacha.anime_title));
      console.log(`✓ ${entries.length}/${target} #${gacha.id} ${gacha.name}`);
    } catch (error) {
      console.log(`- 건너뜀 #${gacha.id} ${gacha.name}: ${(error as Error).message}`);
    }
  }

  if (entries.length < target) {
    throw new Error(`${target}개를 채우지 못했다 (${entries.length}개). --from · --to 를 넓힌다.`);
  }
  await writeCatalog({
    source: GASHAPON_ORIGIN,
    collectedAt: new Date().toISOString().slice(0, 10),
    entries,
  });
  console.log("supabase/catalog/legacy-60.json 저장. 다음: nameKr 채우기 → sql");
}

await main();
