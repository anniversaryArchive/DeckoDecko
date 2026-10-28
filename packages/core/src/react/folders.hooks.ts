"use client";

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../queryKeys";
import { useLocalRepositories } from "./provider";
import { normalizeName } from "../name";

/** 폴더 목록 (sequence 순, 기본 폴더가 맨 앞) */
export function useFolders() {
  const { folders } = useLocalRepositories();
  return useQuery({
    queryKey: queryKeys.folders.list(),
    queryFn: () => folders.listFolders(),
  });
}

/** 같은 이름의 폴더가 있는지. 이름이 비어 있으면 요청하지 않는다. */
export function useIsFolderNameTaken(name: string, excludeId?: string) {
  const { folders } = useLocalRepositories();
  const key = normalizeName(name);
  return useQuery({
    queryKey: queryKeys.folders.nameTaken(key, excludeId ?? null),
    queryFn: key ? () => folders.isFolderNameTaken(name, excludeId) : skipToken,
  });
}

// 쓰기 훅의 invalidate · 에러 규칙은 items.hooks.ts 와 같다.

export function useCreateFolder() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => folders.createFolder(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
  });
}

export function useRenameFolder() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => folders.renameFolder(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
  });
}

/** 지운 폴더의 기록은 기본 폴더로 옮겨지므로 기록 쿼리도 같이 비운다. */
export function useDeleteFolder() {
  const { folders } = useLocalRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => folders.deleteFolder(id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
      ]),
  });
}
