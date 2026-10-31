"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryKeys } from "../queryKeys";
import { useRepositories } from "./provider";
import { serverNetworkMode } from "./queryClient";
import { MEDIA_DEFAULTS, searchMedia } from "../repositories/media";
import type { MediaEntry } from "../repositories/media";

/**
 * 작품 자동완성 (요청 · 문의의 작품 칸). 이름(한 · 일 · 영) · 별칭으로 찾는다.
 * 작품 전체를 한 번 받아 기기에서 거르므로, 화면을 열면 검색어가 비어 있어도 목록을 받기 시작한다. 글자마다 요청하지 않아 디바운스가 필요 없다.
 * data 는 받기 전 undefined, 빈 검색어면 []. 작품 저장소를 넘기지 않았으면 요청하지 않는다 (data 는 undefined).
 * 고르지 않고 적은 글자는 그대로 보낸다 (SendFeedbackInput 의 media: { text }).
 */
export function useMediaSearch(keyword: string, limit: number = MEDIA_DEFAULTS.searchLimit) {
  const { media } = useRepositories();
  const select = useCallback(
    (entries: MediaEntry[]) => searchMedia(entries, { keyword, limit }),
    [keyword, limit]
  );
  return useQuery({
    ...serverNetworkMode,
    queryKey: queryKeys.media.list(),
    queryFn: media ? () => media.listMedia() : skipToken,
    select,
  });
}
