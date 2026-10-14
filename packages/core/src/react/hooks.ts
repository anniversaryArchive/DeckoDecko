"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "../queryKeys";
import { useRepositories } from "./provider";

/** 홈 "새로 나왔어요" */
export function useGachaList(limit?: number) {
  const { gacha } = useRepositories();
  return useQuery({
    queryKey: queryKeys.gacha.list(limit),
    queryFn: () => gacha.listGacha({ limit }),
  });
}

/** 홈 "지금 인기" */
export function usePopularGacha(limit?: number) {
  const { gacha } = useRepositories();
  return useQuery({
    queryKey: queryKeys.gacha.popular(limit),
    queryFn: () => gacha.listPopularGacha(limit),
  });
}

/** 가챠 상세. id 가 비어 있으면 요청하지 않는다. */
export function useGacha(id: string | undefined) {
  const { gacha } = useRepositories();
  return useQuery({
    queryKey: queryKeys.gacha.detail(id ?? ""),
    queryFn: () => gacha.getGacha(id ?? ""),
    enabled: Boolean(id),
  });
}

/**
 * 검색. 빈 검색어는 요청하지 않는다. 페이지를 넘길 때 이전 결과를 유지해 목록이 깜빡이지 않게 한다.
 * 입력 디바운스는 화면 쪽에서 한다 (검색어 상태를 300ms 뒤에 넘기는 식).
 */
export function useGachaSearch(keyword: string, options?: { limit?: number; offset?: number }) {
  const { gacha } = useRepositories();
  const trimmed = keyword.trim();
  return useQuery({
    queryKey: queryKeys.gacha.search(trimmed, options?.offset ?? 0),
    queryFn: () => gacha.searchGacha({ keyword: trimmed, ...options }),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
}
