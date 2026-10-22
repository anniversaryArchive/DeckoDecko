import type { ItemCounts } from "./types";

/** 소장률(%) = GET ÷ (WISH + GET) × 100, 정수 버림. 기록이 없으면 0 */
export function collectionRate(counts: ItemCounts): number {
  const total = counts.wish + counts.get;
  return total === 0 ? 0 : Math.floor((counts.get / total) * 100);
}
