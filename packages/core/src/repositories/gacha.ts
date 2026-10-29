import type { Gacha, GachaDetail, Page } from "../types";

/**
 * 인자를 생략했을 때의 기본값. 구현과 훅(쿼리 키)이 같은 값을 쓰도록 여기 둔다.
 * limit 이 양의 정수가 아니거나 offset 이 0 이상의 정수가 아니면(음수 · 소수 · NaN) 생략한 것으로 보고 이 값을 쓴다.
 */
export const GACHA_DEFAULTS = {
  listLimit: 20,
  popularLimit: 10,
  searchLimit: 20,
  searchOffset: 0,
  /** 검색 결과 무한 스크롤의 한 페이지 */
  searchPageSize: 10,
  searchSort: "release",
} as const;

/** GACHA_DEFAULTS 의 규칙대로 limit · offset 을 고른다. 두 구현이 같이 쓴다 (한쪽만 고치면 페이지 동작이 갈린다). */
export function count(n: number | undefined, fallback: number, min = 1): number {
  return n !== undefined && Number.isInteger(n) && n >= min ? n : fallback;
}

/**
 * 발매 시기 필터 (목록 칩 "전체 · 신상품 · 발매 예정"). 기준 달은 오늘(기기 시간)이 속한 달.
 *   all      : 거르지 않는다
 *   new      : 이번 달 발매 (releaseMonth === 이번 달)
 *   upcoming : 다음 달 이후 발매 (releaseMonth > 이번 달)
 * 발매월을 모르는(null) 가챠는 new · upcoming 어디에도 들지 않는다.
 */
export type GachaReleaseFilter = "all" | "new" | "upcoming";

/**
 * 정렬.
 *   release   : 발매일순. 발매월이 늦은 것(발매 예정 → 최근 발매)부터
 *   priceAsc  : 가격 낮은순
 *   priceDesc : 가격 높은순
 * 모르는 값(null)은 어느 정렬이든 맨 뒤. 값이 같으면 기본 순서(최근 등록순)를 유지한다.
 */
export type GachaSort = "release" | "priceAsc" | "priceDesc";

/** 검색 결과 필터. 생략한 항목은 거르지 않는다. 여러 개를 주면 모두 만족해야 한다 (AND). */
export type GachaFilter = {
  release?: GachaReleaseFilter; // 기본 all
  mediaId?: string | null; // 작품 하나. null · 생략이면 모든 작품
  priceMin?: number | null; // 엔, 이 값 이상. 가격 조건이 있으면 가격을 모르는(null) 가챠는 빠진다
  priceMax?: number | null; // 엔, 이 값 이하
};

/** 기본값을 채운 필터. 쿼리 키와 구현이 같은 모양을 쓴다 (생략 · undefined · null 이 같은 키가 되도록). */
export type ResolvedGachaFilter = {
  release: GachaReleaseFilter;
  mediaId: string | null;
  priceMin: number | null;
  priceMax: number | null;
};

/** 필터의 생략한 항목을 기본값으로 채운다. 가격이 유한한 숫자가 아니면(NaN 등) 조건 없음으로 본다. */
export function resolveGachaFilter(filter?: GachaFilter): ResolvedGachaFilter {
  const price = (v: number | null | undefined) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  return {
    release: filter?.release ?? "all",
    mediaId: filter?.mediaId || null,
    priceMin: price(filter?.priceMin),
    priceMax: price(filter?.priceMax),
  };
}

/** 날짜가 속한 달 "YYYY-MM" (기기 시간대). 신상품 · 발매 예정의 기준 달. releaseMonth 와 글자 그대로 비교할 수 있다. */
export function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * 발매월이 기준 달(toYearMonth)에 비해 어디쯤인지. 신상품 · 발매 예정 필터와 카드 배지가 같이 쓴다.
 * new: 이번 달 발매, upcoming: 다음 달 이후. 지난 발매 · 발매월 모름은 null.
 */
export type ReleaseStatus = "new" | "upcoming";

export function releaseStatus(
  releaseMonth: string | null | undefined,
  thisMonth: string
): ReleaseStatus | null {
  if (releaseMonth == null) return null;
  if (releaseMonth === thisMonth) return "new";
  return releaseMonth > thisMonth ? "upcoming" : null;
}

/** 저장소를 만들 때의 선택 사항 (메모리 · Supabase 구현 공통). */
export type GachaRepositoryOptions = {
  /** 신상품 · 발매 예정의 기준 시각. 테스트에서 고정한다. 기본은 호출할 때의 현재 시각 */
  now?: () => Date;
};

export type ListGachaParams = {
  limit?: number; // 기본 20
};

export type SearchGachaParams = {
  keyword: string; // 가챠 이름(한 · 일) · 작품명을 함께 검색한다
  filter?: GachaFilter;
  sort?: GachaSort; // 기본 release
  limit?: number; // 기본 20
  offset?: number; // 기본 0
};

/**
 * 가챠 카탈로그 읽기. 화면은 이 인터페이스의 훅(./react)만 쓰고 구현을 모른다.
 *   1주차: createMemoryGachaRepository (앱의 목 데이터)
 *   2주차: createSupabaseGachaRepository (Supabase, 검색 · 인기는 3주차 RPC 로 교체)
 */
export interface GachaRepository {
  listGacha(params?: ListGachaParams): Promise<Gacha[]>; // 최신순 목록 (홈 "새로 나왔어요")
  /** 인기순 목록 (홈 "지금 인기"), 기본 10개. 조회가 없는 가챠는 빠지므로 limit 보다 적을 수 있다 */
  listPopularGacha(limit?: number): Promise<Gacha[]>;
  /** 여러 가챠를 한 번에 (검색 "최근 본 굿즈"). 받은 id 순서대로 돌려주고, 없는 id 는 뺀다 */
  listGachaByIds(ids: readonly string[]): Promise<Gacha[]>;
  getGacha(id: string): Promise<GachaDetail | null>; // 없으면 null
  /**
   * 검색어 + 필터로 거르고 정렬한 결과 중 offset 부터 limit 개와, 페이지와 무관한 전체 일치 개수(total)를 돌려준다.
   * total 은 필터까지 적용한 개수다 (결과 화면의 "총 N개"). 빈 검색어는 { items: [], total: 0 }.
   */
  searchGacha(params: SearchGachaParams): Promise<Page<Gacha>>;
}
