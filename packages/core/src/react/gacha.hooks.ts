"use client";

import {
  keepPreviousData,
  skipToken,
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";

import { flattenPages, nextPageOffset } from "../pagination";
import { queryKeys } from "../queryKeys";
import { useRepositories } from "./provider";
import { GACHA_DEFAULTS, resolveGachaFilter, toYearMonth } from "../repositories/gacha";
import type { GachaFilter, GachaSort } from "../repositories/gacha";
import type { Gacha, Page } from "../types";

/** 홈 "새로 나왔어요" */
export function useGachaList(limit: number = GACHA_DEFAULTS.listLimit) {
  const { gacha } = useRepositories();
  return useQuery({
    queryKey: queryKeys.gacha.list(limit),
    queryFn: () => gacha.listGacha({ limit }),
  });
}

/** 홈 "지금 인기" */
export function usePopularGacha(limit: number = GACHA_DEFAULTS.popularLimit) {
  const { gacha } = useRepositories();
  return useQuery({
    queryKey: queryKeys.gacha.popular(limit),
    queryFn: () => gacha.listPopularGacha(limit),
  });
}

/** 가챠 상세. id 가 비어 있으면 요청하지 않는다 (이때 isPending 은 계속 true 라서 로딩 확인은 isLoading 으로). */
export function useGacha(id: string | undefined) {
  const { gacha } = useRepositories();
  return useQuery({
    queryKey: queryKeys.gacha.detail(id ?? ""),
    queryFn: id ? () => gacha.getGacha(id) : skipToken,
  });
}

// select 를 모듈 밖에 두어 참조가 같게 유지한다 (React Query 가 결과를 재사용해 목록이 매번 다시 그려지지 않는다)
function selectSearchPages(data: InfiniteData<Page<Gacha>, number>): Page<Gacha> {
  return flattenPages(data.pages);
}

/**
 * 검색 결과 무한 스크롤 (기본 10개씩). data 는 받은 페이지를 이은 { items, total } 이고 total 은 필터까지 적용한 전체 개수.
 * 다음 페이지는 fetchNextPage, 남았는지는 hasNextPage. 빈 검색어는 요청하지 않는다.
 * 검색어 · 필터 · 정렬을 바꾸면 새 결과가 올 때까지 이전 결과를 들고 있다 (isPlaceholderData). 그동안 보일지는 화면이 정한다.
 */
export function useGachaSearchPages(
  keyword: string,
  options?: { filter?: GachaFilter; sort?: GachaSort; pageSize?: number }
) {
  const { gacha } = useRepositories();
  const trimmed = keyword.trim();
  const filter = resolveGachaFilter(options?.filter);
  const sort = options?.sort ?? GACHA_DEFAULTS.searchSort;
  const pageSize = options?.pageSize ?? GACHA_DEFAULTS.searchPageSize;
  return useInfiniteQuery({
    // 기준 달을 키에 넣어 달이 바뀌면 새로 받는다 (안 그러면 지난달 신상품 결과가 캐시에서 그대로 나온다)
    queryKey: queryKeys.gacha.searchPages(trimmed, filter, sort, pageSize, toYearMonth(new Date())),
    queryFn: trimmed
      ? ({ pageParam }) =>
          gacha.searchGacha({ keyword: trimmed, filter, sort, offset: pageParam, limit: pageSize })
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => nextPageOffset(allPages),
    select: selectSearchPages,
    placeholderData: trimmed ? keepPreviousData : undefined,
    // 오래된 무한 쿼리를 다시 받으면 받아 둔 페이지를 처음부터 모두 다시 요청한다. 조건을 바꾸면 새 키라 새로 받으므로 저절로 다시 받지 않는다
    staleTime: Infinity,
  });
}
