// 앱이 넘긴 값(id · 검색 조건) → Supabase 요청 값

import type { Database } from "../database.types";
import { GACHA_DEFAULTS, type GachaSort, type ResolvedGachaFilter } from "./gacha";

/**
 * DB id 는 bigint. 숫자가 아닌 id 는 요청하지 않고 없는 것으로 본다.
 * "007" 처럼 앞에 0 이 붙은 id 도 없는 것으로 본다 (받으면 돌려주는 id "7" 과 캐시 키가 어긋난다).
 */
export function toDbId(id: string): number | null {
  if (!/^(0|[1-9]\d*)$/.test(id)) return null;
  const n = Number(id);
  return Number.isSafeInteger(n) ? n : null;
}

export type SearchRpcArgs = Database["public"]["Functions"]["search_gacha_with_anime"]["Args"];

/**
 * 검색 RPC(search_gacha_with_anime)의 인자. 필터 · 정렬 규칙은 RPC 와 메모리 구현이 같고, 여기서는 이름만 옮긴다.
 * 조건이 없는 칸은 넣지 않는다 (RPC 기본값 null = 조건 없음). 맞을 수 없는 조건(숫자가 아닌 작품 id)이면 null.
 * this_month 는 date 라서 "YYYY-MM" 에 1일을 붙인다. 기기 시간대의 이번 달을 늘 넘긴다 (비우면 DB(UTC) 기준이라 월초에 9시간 어긋난다).
 */
export function toSearchRpcArgs(input: {
  keyword: string;
  limit: number;
  offset: number;
  filter: ResolvedGachaFilter;
  sort: GachaSort | undefined;
  thisMonth: string; // "YYYY-MM" (toYearMonth)
}): SearchRpcArgs | null {
  const { filter } = input;
  const args: SearchRpcArgs = {
    keyword: input.keyword,
    limit_count: input.limit,
    offset_count: input.offset,
    this_month: `${input.thisMonth}-01`,
    sort_by: input.sort ?? GACHA_DEFAULTS.searchSort,
  };
  if (filter.release !== "all") args.release_filter = filter.release;
  if (filter.mediaId != null) {
    const animeId = toDbId(filter.mediaId);
    if (animeId === null) return null;
    args.anime_filter = animeId;
  }
  if (filter.priceMin != null) args.price_min = filter.priceMin;
  if (filter.priceMax != null) args.price_max = filter.priceMax;
  return args;
}
