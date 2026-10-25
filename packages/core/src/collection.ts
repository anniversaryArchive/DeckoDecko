// 소장 상태 계산 (홈 소장률 · 3주차 가챠별 소장률). 화면에 보일 문자열은 i18n 헬퍼가 만든다.
import type { ItemCounts } from "./types";

/**
 * 홈 소장률(%) = GET ÷ (WISH + GET) × 100, 정수 버림. 기록이 없으면 0. 버림이라 다 모아야만 100 이 된다.
 * ProgressBar 는 0~1 을 받으므로 100 으로 나눠 넘긴다. 가챠별 소장률(GET ÷ 라인업 종 수)은 다른 값이다.
 */
export function collectionRate(counts: ItemCounts): number {
  const total = counts.wish + counts.get;
  // 나누기를 먼저 하면 부동소수 오차로 한 칸 덜 나온다 (29 ÷ 50 × 100 = 57.99… → 57)
  return total === 0 ? 0 : Math.floor((counts.get * 100) / total);
}

/** 가챠 하나의 소장 현황. get + wish + missing === total */
export type GachaCollection = {
  /** 라인업 종 수 (gacha_items) */
  total: number;
  /** 가진 종 수 (GET) */
  get: number;
  /** 갖고 싶은 종 수 (WISH) */
  wish: number;
  /** 아직 기록하지 않은 종 수 */
  missing: number;
  /** get ÷ total × 100, 정수 버림. 라인업이 없으면 0 */
  rate: number;
};

/**
 * 가챠 상세의 소장률 바. "가진 수 / 전체 종".
 * 기록(items)은 라인업 아이템을 가리키지 않고 이름만 들고 있어서(가챠 안에서 이름 중복 금지) 기록 한 건을 한 종으로 센다.
 * 라인업에 없는 것(시크릿 등)까지 적어 종 수를 넘으면 GET 부터 채우고 남는 자리만 WISH 로 센다. 바가 100% 를 넘지 않게 하려는 것.
 */
export function gachaCollection(counts: ItemCounts, lineupTotal: number): GachaCollection {
  const total = Math.max(0, Math.floor(lineupTotal));
  const get = Math.min(counts.get, total);
  const wish = Math.min(counts.wish, total - get);
  return {
    total,
    get,
    wish,
    missing: total - get - wish,
    rate: total === 0 ? 0 : Math.floor((get / total) * 100),
  };
}
