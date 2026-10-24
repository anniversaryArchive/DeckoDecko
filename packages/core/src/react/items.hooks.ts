"use client";

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../queryKeys";
import type { CreateItemInput, ListItemsParams, UpdateItemInput } from "../repositories/items";
import { normalizeName } from "../repositories/name";
import type { ItemType } from "../types";
import { useLocalRepositories } from "./provider";

/** 기록 목록. 상세(가챠별) · 내 굿즈(타입별 · 폴더별)가 조건만 바꿔 쓴다. */
export function useItems(params: ListItemsParams = {}) {
  const { items } = useLocalRepositories();
  const { gachaId, type, folderId } = params;
  return useQuery({
    queryKey: queryKeys.items.list(gachaId ?? null, type ?? null, folderId ?? null),
    queryFn: () => items.listItems({ gachaId, type, folderId }),
  });
}

/** 기록 하나 (수정 시트). id 가 비어 있으면 요청하지 않는다. */
export function useItem(id: string | undefined) {
  const { items } = useLocalRepositories();
  return useQuery({
    queryKey: queryKeys.items.detail(id ?? ""),
    queryFn: id ? () => items.getItem(id) : skipToken,
  });
}

/** WISH · GET 개수. gachaId 를 생략하면 전체 (홈 소장률). 비율은 collectionRate 로 계산한다. */
export function useItemCounts(gachaId?: string) {
  const { items } = useLocalRepositories();
  return useQuery({
    queryKey: queryKeys.items.counts(gachaId ?? null),
    queryFn: () => items.countItems({ gachaId }),
  });
}

/** 폴더 id → 기록 수 (폴더 선택 시트). 기록이 없는 폴더는 빠지므로 `?? 0` 으로 읽는다. */
export function useItemCountsByFolder() {
  const { items } = useLocalRepositories();
  return useQuery({
    queryKey: queryKeys.items.countsByFolder(),
    queryFn: () => items.countItemsByFolder(),
  });
}

/**
 * 같은 가챠 안에 같은 이름의 기록이 있는지. 시트의 이름 입력에서 쓴다 (입력 디바운스는 화면 쪽).
 * gachaId 가 없거나 이름이 비어 있으면 요청하지 않는다.
 */
export function useIsItemNameTaken(gachaId: string | undefined, name: string, excludeId?: string) {
  const { items } = useLocalRepositories();
  const key = normalizeName(name);
  return useQuery({
    queryKey: queryKeys.items.nameTaken(gachaId ?? "", key, excludeId ?? null),
    queryFn: gachaId && key ? () => items.isItemNameTaken({ gachaId, name, excludeId }) : skipToken,
  });
}

// 쓰기 훅은 invalidate 까지 기다린 뒤 끝난다. mutateAsync 가 풀리면 목록 · 소장률이 이미 새 값이다.
// 실패는 잡지 않고 그대로 올린다 (mutation.error, mutateAsync 의 reject).

function useInvalidateItems() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
}

export function useCreateItem() {
  const { items } = useLocalRepositories();
  const invalidate = useInvalidateItems();
  return useMutation({
    mutationFn: (input: CreateItemInput) => items.createItem(input),
    onSuccess: invalidate,
  });
}

export function useUpdateItem() {
  const { items } = useLocalRepositories();
  const invalidate = useInvalidateItems();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateItemInput }) =>
      items.updateItem(id, input),
    onSuccess: invalidate,
  });
}

/** WISH ↔ GET 원탭 전환 (목록 · 상세) */
export function useSetItemType() {
  const { items } = useLocalRepositories();
  const invalidate = useInvalidateItems();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: ItemType }) => items.updateItem(id, { type }),
    onSuccess: invalidate,
  });
}

export function useDeleteItem() {
  const { items } = useLocalRepositories();
  const invalidate = useInvalidateItems();
  return useMutation({
    mutationFn: (id: string) => items.deleteItem(id),
    onSuccess: invalidate,
  });
}
