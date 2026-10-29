import type { ItemCounts, ItemType } from "./types";

/** 개수를 세는 행. 기록 한 건이면 n 을 빼고(1건), SQL group by 결과면 n 에 개수를 넣는다 */
type CountRow = { type: ItemType; n?: number };

/** 행들을 WISH · GET 개수로 접는다. 로컬 저장소 구현(앱 SQLite · 메모리)이 같이 쓴다 */
export function toItemCounts(rows: readonly CountRow[]): ItemCounts {
  const counts: ItemCounts = { wish: 0, get: 0 };
  for (const r of rows) counts[r.type === "WISH" ? "wish" : "get"] += r.n ?? 1;
  return counts;
}

/** toItemCounts 를 key 마다. 행이 없는 key 는 빠진다 */
export function toItemCountsBy<R extends CountRow>(
  rows: readonly R[],
  keyOf: (row: R) => string
): Record<string, ItemCounts> {
  const groups: Record<string, R[]> = {};
  for (const r of rows) (groups[keyOf(r)] ??= []).push(r);
  return Object.fromEntries(Object.entries(groups).map(([key, g]) => [key, toItemCounts(g)]));
}
