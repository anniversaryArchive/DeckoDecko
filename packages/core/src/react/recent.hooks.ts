"use client";

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys } from "../queryKeys";
import { useRepositories } from "./provider";
import { localNetworkMode, serverNetworkMode } from "./queryClient";
import type { RecentRepository } from "../repositories/recent";

/** 최근 기록 저장소. CoreProvider 에 recent 를 넘기지 않은 앱(백오피스)에서 쓰면 던진다. */
function useRecentRepository(): RecentRepository {
  const { recent } = useRepositories();
  if (!recent) {
    throw new Error("최근 기록 훅은 CoreProvider 에 recent 저장소를 넘긴 앱에서만 쓸 수 있다.");
  }
  return recent;
}

/**
 * 쓰기 훅 공통: 저장소가 돌려준 바뀐 목록으로 캐시를 바로 바꾼다 (다시 읽지 않음).
 * 실패하면 캐시는 그대로 두고 mutation 의 error 로 알린다.
 */
function useRecentMutation<TVariables>(
  queryKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<string[]>
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...localNetworkMode,
    mutationFn,
    onSuccess: (list) => queryClient.setQueryData(queryKey, list),
  });
}

// ── 최근 검색어 ──

/** 최근 검색어 (최신이 앞, 최대 10개) */
export function useRecentSearches() {
  const recent = useRecentRepository();
  return useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.recent.searches(),
    queryFn: () => recent.listSearches(),
  });
}

/** 검색어 기록. 같은 검색어면 맨 앞으로 옮긴다. 공백뿐이면 기록하지 않는다. */
export function useAddRecentSearch() {
  const recent = useRecentRepository();
  return useRecentMutation(queryKeys.recent.searches(), (keyword: string) =>
    recent.addSearch(keyword)
  );
}

export function useRemoveRecentSearch() {
  const recent = useRecentRepository();
  return useRecentMutation(queryKeys.recent.searches(), (keyword: string) =>
    recent.removeSearch(keyword)
  );
}

export function useClearRecentSearches() {
  const recent = useRecentRepository();
  return useRecentMutation(queryKeys.recent.searches(), () => recent.clearSearches());
}

// ── 최근 본 가챠 ──

/**
 * 가챠 상세에 들어갈 때 id 를 최근 본 가챠로 기록한다 (상세 화면에서 한 번 부른다).
 * 주소의 id 가 아니라 불러온 가챠의 id 를 넘긴다 (없는 가챠는 남기지 않게). 불러오기 전 · 없으면 undefined.
 * id 가 바뀔 때마다 기록하고, 비어 있으면 아무것도 하지 않는다. 실패해도 화면에는 알리지 않는다.
 */
export function useRecordRecentGacha(id: string | undefined) {
  const recent = useRecentRepository();
  const { mutate } = useRecentMutation(queryKeys.recent.gachaIds(), (gachaId: string) =>
    recent.addGachaId(gachaId)
  );
  useEffect(() => {
    if (id) mutate(id);
  }, [id, mutate]);
}

export function useClearRecentGacha() {
  const recent = useRecentRepository();
  return useRecentMutation(queryKeys.recent.gachaIds(), () => recent.clearGachaIds());
}

type QueryPart<T> = { data: T | undefined; isLoading: boolean; isError: boolean };

/**
 * 저장된 id 목록 쿼리와 가챠 목록 쿼리를 하나의 결과로 합친다 (useRecentGacha 안쪽, 테스트용으로 뺐다).
 * 둘 중 하나라도 불러오는 중이면 isLoading, 실패하면 isError. id 가 없으면 목록 쿼리와 상관없이 빈 목록.
 * 목록은 지금 id 목록에 있는 가챠만 남긴다.
 */
export function combineRecentGacha<T extends { id: string }>(
  ids: QueryPart<readonly string[]>,
  list: QueryPart<T[]>
): QueryPart<T[]> {
  const idSet = new Set(ids.data);
  return {
    // 목록 쿼리의 이전 목록(keepPreviousData)은 지운 기록을 품을 수 있어(전체 삭제 뒤 placeholder 가 이어짐) 지금 id 로 거른다
    data:
      ids.data === undefined
        ? undefined
        : ids.data.length === 0
          ? []
          : list.data?.filter((g) => idSet.has(g.id)),
    isLoading: ids.isLoading || list.isLoading,
    isError: ids.isError || list.isError,
  };
}

/**
 * 최근 본 가챠 목록 (최신이 앞). 저장된 id 로 가챠 요약을 한 번에 다시 조회한다 (listGachaByIds).
 * 카탈로그에서 사라진 가챠는 저장소가 빼고 돌려준다.
 * 새로 본 가챠가 붙어 id 가 바뀌어도 새 목록이 올 때까지 이전 목록을 들고 있어 섹션이 깜빡이지 않는다.
 * 돌려주는 모양은 useQuery 결과 중 data · isLoading · isError · refetch 만 (화면의 QueryState 에 그대로 넘긴다).
 */
export function useRecentGacha() {
  const { gacha } = useRepositories();
  const recent = useRecentRepository();
  // id 목록은 기기 저장소, 가챠 목록은 서버라 id 목록만 오프라인에서도 읽는다
  const ids = useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.recent.gachaIds(),
    queryFn: () => recent.listGachaIds(),
  });
  const idList = ids.data ?? [];
  const list = useQuery({
    ...serverNetworkMode,
    queryKey: queryKeys.gacha.byIds(idList),
    queryFn: idList.length > 0 ? () => gacha.listGachaByIds(idList) : skipToken,
    placeholderData: keepPreviousData,
  });

  return {
    ...combineRecentGacha(ids, list),
    refetch: () => (ids.isError ? ids.refetch() : list.refetch()),
  };
}
