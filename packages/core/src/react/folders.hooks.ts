"use client";

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../queryKeys";
import { useLocalRepositories } from "./provider";
import { localNetworkMode } from "./queryClient";
import { normalizeName } from "../name";
import type { Folder } from "../types";

/** 폴더 목록 (sequence 순, 기본 폴더가 맨 앞) */
export function useFolders() {
  const { folders } = useLocalRepositories();
  return useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.folders.list(),
    queryFn: () => folders.listFolders(),
  });
}

/** 같은 이름의 폴더가 있는지. 이름이 비어 있으면 요청하지 않는다. */
export function useIsFolderNameTaken(name: string, excludeId?: string) {
  const { folders } = useLocalRepositories();
  const key = normalizeName(name);
  return useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.folders.nameTaken(key, excludeId ?? null),
    queryFn: key ? () => folders.isFolderNameTaken(name, excludeId) : skipToken,
  });
}

// 쓰기 훅의 invalidate · 에러 규칙은 items.hooks.ts 와 같다.

export function useCreateFolder() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    ...localNetworkMode,
    mutationFn: (name: string) => folders.createFolder(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
  });
}

export function useRenameFolder() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    ...localNetworkMode,
    mutationFn: ({ id, name }: { id: string; name: string }) => folders.renameFolder(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
  });
}

/** 지운 폴더의 기록은 기본 폴더로 옮겨지므로 기록 쿼리도 같이 비운다. */
export function useDeleteFolder() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    ...localNetworkMode,
    mutationFn: (id: string) => folders.deleteFolder(id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
      ]),
  });
}

const REORDER_FOLDERS_KEY = ["folders", "reorder"] as const;

/**
 * 일반 폴더의 순서를 바꾼다 (ids 는 기본 폴더를 뺀 전체). 폴더 목록 캐시는 저장을 기다리지 않고 바로 바뀐다.
 * 저장에 실패하면 이전 순서로 되돌리고 mutation 의 error 로 알린다.
 */
export function useReorderFolders() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.folders.list();
  return useMutation({
    ...localNetworkMode,
    mutationKey: REORDER_FOLDERS_KEY,
    // 연달아 끌면 저장을 차례로 한다 (캐시는 바로 바뀌고 저장만 줄을 선다)
    scope: { id: REORDER_FOLDERS_KEY.join(".") },
    mutationFn: (ids: readonly string[]) => folders.reorderFolders(ids),
    onMutate: async (ids) => {
      // 진행 중인 읽기가 끝나면서 바꾼 순서를 이전 순서로 덮지 않게 멈춘다
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Folder[]>(queryKey);
      if (previous) {
        const byId = new Map(previous.map((f) => [f.id, f]));
        const moved = ids.flatMap((id) => byId.get(id) ?? []);
        queryClient.setQueryData(queryKey, [...previous.filter((f) => f.isDefault), ...moved]);
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    // 줄 선 저장이 남아 있으면 다시 읽지 않는다. 읽은 값이 아직 저장 전인 순서로 화면을 되돌린다
    onSettled: () =>
      queryClient.isMutating({ mutationKey: REORDER_FOLDERS_KEY }) > 1
        ? undefined
        : queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
  });
}
