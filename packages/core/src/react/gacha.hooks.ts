"use client";

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "../queryKeys";
import { useRepositories } from "./provider";
import { GACHA_DEFAULTS } from "../repositories/gacha";
import type { Gacha } from "../types";

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

/**
 * 검색. 빈 검색어는 요청하지 않는다. 페이지를 넘길 때 이전 결과를 유지해 목록이 깜빡이지 않게 한다.
 * 입력 디바운스는 화면 쪽에서 한다 (검색어 상태를 300ms 뒤에 넘기는 식).
 */
export function useGachaSearch(keyword: string, options?: { limit?: number; offset?: number }) {
  const { gacha } = useRepositories();
  const trimmed = keyword.trim();
  const offset = options?.offset ?? GACHA_DEFAULTS.searchOffset;
  const limit = options?.limit ?? GACHA_DEFAULTS.searchLimit;
  return useQuery({
    queryKey: queryKeys.gacha.search(trimmed, offset, limit),
    queryFn: trimmed ? () => gacha.searchGacha({ keyword: trimmed, offset, limit }) : skipToken,
    // 검색어를 비우면 이전 결과도 지운다 (keepPreviousData 는 꺼진 쿼리에도 마지막 결과를 돌려준다)
    placeholderData: trimmed ? keepPreviousData : undefined,
  });
}

/**
 * 여러 가챠의 요약을 id 로 한 번에 (내 굿즈 카드의 가챠 이름 · 이미지 · 가챠 이름 검색). id → 가챠 Map 으로 돌려준다.
 * 순서 · 중복은 보지 않는다. 카탈로그에 없는 id 는 Map 에 없다. 빈 목록이면 요청하지 않는다.
 * 기록이 늘어 id 가 바뀌어도 새 결과가 올 때까지 이전 결과를 들고 있어 카드의 이름이 깜빡이지 않는다.
 */
export function useGachasByIds(ids: readonly string[]) {
  const { gacha } = useRepositories();
  // 순서만 다른 목록이 다른 키로 두 번 캐시되지 않게 정렬해서 키로 쓴다
  const key = useMemo(() => [...new Set(ids)].sort(), [ids]);
  return useQuery({
    queryKey: queryKeys.gacha.byIds(key),
    queryFn: key.length > 0 ? () => gacha.listGachaByIds(key) : skipToken,
    // 기록을 모두 지워 빈 목록이 되면 이전 결과도 지운다 (keepPreviousData 는 꺼진 쿼리에도 마지막 결과를 돌려준다)
    placeholderData: key.length > 0 ? keepPreviousData : undefined,
    select: toGachaMap,
  });
}

function toGachaMap(list: Gacha[]): Map<string, Gacha> {
  return new Map(list.map((g) => [g.id, g]));
}
