"use client";

import { skipToken, useQuery } from "@tanstack/react-query";

import { queryKeys } from "../queryKeys";
import { useRepositories } from "./provider";
import { serverNetworkMode } from "./queryClient";
import { NOTICE_DEFAULTS } from "../repositories/notice";

/**
 * 공지 목록, 고정 공지 먼저 · 최신순 (공지 목록 화면).
 * 공지 저장소를 넘기지 않았으면 요청하지 않는다 (data 는 undefined, isLoading 은 false → 공지 없음으로 그린다).
 */
export function useNotices(limit: number = NOTICE_DEFAULTS.listLimit) {
  const { notice } = useRepositories();
  return useQuery({
    ...serverNetworkMode,
    queryKey: queryKeys.notice.list(limit),
    queryFn: notice ? () => notice.listNotices({ limit }) : skipToken,
  });
}

/** 홈 공지 띠: 고정 공지만 최신순 2개. 고정 공지가 없거나 공지 저장소가 없으면 data 가 비어 띠를 숨긴다. */
export function useHomeNotices() {
  const { notice } = useRepositories();
  const limit = NOTICE_DEFAULTS.homeLimit;
  return useQuery({
    ...serverNetworkMode,
    queryKey: queryKeys.notice.home(limit),
    queryFn: notice ? () => notice.listNotices({ limit, fixedOnly: true }) : skipToken,
  });
}

/** 공지 상세. id 가 비었거나 공지 저장소가 없으면 요청하지 않는다 (로딩 확인은 isLoading 으로). */
export function useNotice(id: string | undefined) {
  const { notice } = useRepositories();
  return useQuery({
    ...serverNetworkMode,
    queryKey: queryKeys.notice.detail(id ?? ""),
    queryFn: id && notice ? () => notice.getNotice(id) : skipToken,
  });
}
