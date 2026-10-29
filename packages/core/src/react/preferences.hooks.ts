"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../queryKeys";
import type { PreferencesRepository } from "../repositories/preferences";
import type { GoodsViewMode } from "../types";
import { useRepositories } from "./provider";

/** 기기 설정 저장소. CoreProvider 에 preferences 를 넘기지 않은 앱(백오피스)에서 쓰면 던진다. */
function usePreferencesRepository(): PreferencesRepository {
  const { preferences } = useRepositories();
  if (!preferences) {
    throw new Error("설정 훅은 CoreProvider 에 preferences 저장소를 넘긴 앱에서만 쓸 수 있다.");
  }
  return preferences;
}

/** 내 굿즈 보기 방식 (풀어보기 · 묶어보기). 저장된 값이 없으면 풀어보기 */
export function useGoodsViewMode() {
  const preferences = usePreferencesRepository();
  return useQuery({
    queryKey: queryKeys.preferences.goodsViewMode(),
    queryFn: () => preferences.getGoodsViewMode(),
    // 이 기기에서만 바뀌는 값이라 다시 읽을 일이 없다
    staleTime: Infinity,
  });
}

/**
 * 보기 방식을 바꾸고 기억한다. 화면은 저장을 기다리지 않고 바로 바뀐다.
 * 저장에 실패하면 화면은 바꾼 방식 그대로 두고 mutation 의 error 로 알린다 (다음에 앱을 켜면 이전 방식).
 */
export function useSetGoodsViewMode() {
  const preferences = usePreferencesRepository();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mode: GoodsViewMode) => preferences.setGoodsViewMode(mode),
    onMutate: async (mode) => {
      const queryKey = queryKeys.preferences.goodsViewMode();
      // 처음 읽기가 끝나기 전에 누르면, 늦게 끝난 읽기가 고른 값을 이전 값으로 덮지 않게 멈춘다
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, mode);
    },
  });
}
