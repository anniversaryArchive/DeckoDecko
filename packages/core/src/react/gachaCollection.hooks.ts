"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { gachaCollectionRates } from "../collection";
import { queryKeys } from "../queryKeys";
import { combineQueryStatus, refetchQueries } from "./combineQueries";
import { useGachasByIds } from "./gacha.hooks";
import { useLocalRepositories } from "./provider";
import { localNetworkMode } from "./queryClient";

const ID_SEPARATOR = "\u0000";

/**
 * 여러 가챠의 소장률을 한 번에. 가챠 id → { counts, collection } (gachaCollectionRates).
 * GET 수는 로컬 기록 전체를 가챠별로 한 번에 세고, 라인업 수는 원격에서 ids 로 한 번에 받는다 (useGachasByIds 와 캐시를 같이 쓴다).
 * 라인업 수를 모르는 가챠(카탈로그에 없음 · 라인업 0)는 collection 이 null. ids 가 비어 있으면 원격 요청 없이 빈 객체.
 * 렌더마다 새 배열을 넘겨도 내용이 같으면 data 는 같은 객체다. 순서가 달라도 원격 요청은 다시 하지 않는다.
 * 돌려주는 모양은 useQuery 결과 중 data · isLoading · isError · refetch 만 (화면의 QueryState 에 그대로 넘긴다).
 */
export function useGachaCollections(ids: readonly string[]) {
  const { items } = useLocalRepositories();
  const counts = useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.items.countsByGacha(),
    queryFn: () => items.countItemsByGacha(),
  });
  const idsKey = ids.join(ID_SEPARATOR);
  const stableIds = useMemo(() => (idsKey ? idsKey.split(ID_SEPARATOR) : []), [idsKey]);
  const lineups = useGachasByIds(stableIds);

  // 이전 ids 의 결과(placeholder)에 없는 가챠는 라인업 모름(null)이 아니라 아직 불러오는 중이다
  const waitingLineups =
    lineups.isPlaceholderData && stableIds.some((id) => !lineups.data?.has(id));
  const data = useMemo(() => {
    if (!counts.data || waitingLineups) return undefined;
    if (stableIds.length === 0) return {};
    if (!lineups.data) return undefined;
    return gachaCollectionRates(stableIds, counts.data, lineups.data);
  }, [stableIds, counts.data, lineups.data, waitingLineups]);
  const status = combineQueryStatus([counts, lineups]);

  return {
    data,
    isLoading: status.isLoading || waitingLineups,
    isError: status.isError,
    refetch: refetchQueries([counts, lineups]),
  };
}
