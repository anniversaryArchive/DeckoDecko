import type { Gacha, GachaDetail, Page } from "../types";

export type ListGachaParams = {
  limit?: number;
};

export type SearchGachaParams = {
  keyword: string; // 가챠 이름(한 · 일) · 작품명을 함께 검색한다
  limit?: number;
  offset?: number;
};

/**
 * 가챠 카탈로그 읽기. 화면은 이 인터페이스의 훅(./react)만 쓰고 구현을 모른다.
 *   1주차: createMemoryGachaRepository (앱의 목 데이터)
 *   2주차: createSupabaseGachaRepository (Supabase, 검색 · 인기는 3주차 RPC 로 교체)
 */
export interface GachaRepository {
  listGacha(params?: ListGachaParams): Promise<Gacha[]>; // 최신순 목록 (홈 "새로 나왔어요")
  /** 인기순 목록 (홈 "지금 인기"). 3주차 RPC 전까지는 구현이 정렬 기준을 정한다 */
  listPopularGacha(limit?: number): Promise<Gacha[]>;
  getGacha(id: string): Promise<GachaDetail | null>; // 없으면 null
  /** 결과와 전체 개수를 같이 돌려준다 (결과 화면의 "N개") */
  searchGacha(params: SearchGachaParams): Promise<Page<Gacha>>;
}

/** 화면이 쓰는 저장소 묶음. 새 도메인(공지, 요청 · 문의)은 여기에 키를 추가한다. */
export type Repositories = {
  gacha: GachaRepository;
};
