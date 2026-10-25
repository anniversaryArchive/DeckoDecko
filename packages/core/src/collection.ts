import type { ItemCounts } from "./types";

/**
 * 홈 소장률(%) = GET ÷ (WISH + GET) × 100, 정수 버림. 기록이 없으면 0. 버림이라 다 모아야만 100 이 된다.
 * ProgressBar 는 0~1 을 받으므로 100 으로 나눠 넘긴다. 가챠별 소장률(GET ÷ 라인업 종 수)은 다른 값이다.
 */
export function collectionRate(counts: ItemCounts): number {
  const total = counts.wish + counts.get;
  return total === 0 ? 0 : Math.floor((counts.get / total) * 100);
}
