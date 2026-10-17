import type { Gacha, GachaDetail, Page } from "../types";

/** 인자를 생략했을 때의 기본값. 구현과 훅(쿼리 키)이 같은 값을 쓰도록 여기 둔다. */
export const GACHA_DEFAULTS = {
  listLimit: 20,
  popularLimit: 10,
  searchLimit: 20,
  searchOffset: 0,
} as const;

export type ListGachaParams = {
  limit?: number; // 기본 20
};

export type SearchGachaParams = {
  keyword: string; // 가챠 이름(한 · 일) · 작품명을 함께 검색한다
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
  /** 인기순 목록 (홈 "지금 인기"), 기본 10개. 3주차 RPC 전까지는 구현이 정렬 기준을 정한다 */
  listPopularGacha(limit?: number): Promise<Gacha[]>;
  getGacha(id: string): Promise<GachaDetail | null>; // 없으면 null
  /** 결과와 전체 개수를 같이 돌려준다 (결과 화면의 "N개") */
  searchGacha(params: SearchGachaParams): Promise<Page<Gacha>>;
}
