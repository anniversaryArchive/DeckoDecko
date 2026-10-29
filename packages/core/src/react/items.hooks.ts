"use client";

import {
  skipToken,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
  type Mutation,
  type MutationFilters,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { normalizeName } from "../name";
import { queryKeys } from "../queryKeys";
import type { CreateItemInput, ListItemsParams, UpdateItemInput } from "../repositories/items";
import type { Item, ItemType } from "../types";
import { useLocalRepositories } from "./provider";
import { localNetworkMode } from "./queryClient";

/** 기록 목록. 상세(가챠별) · 내 굿즈(타입별 · 폴더별)가 조건만 바꿔 쓴다. */
export function useItems(params: ListItemsParams = {}) {
  const { items } = useLocalRepositories();
  const { gachaId, type, folderId } = params;
  return useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.items.list(gachaId ?? null, type ?? null, folderId ?? null),
    queryFn: () => items.listItems({ gachaId, type, folderId }),
  });
}

/** 기록 하나 (수정 시트). id 가 비어 있으면 요청하지 않는다. */
export function useItem(id: string | undefined) {
  const { items } = useLocalRepositories();
  return useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.items.detail(id ?? ""),
    queryFn: id ? () => items.getItem(id) : skipToken,
  });
}

/** WISH · GET 개수. gachaId 를 생략하면 전체 (홈 소장률). 비율은 collectionRate 로 계산한다. */
export function useItemCounts(gachaId?: string) {
  const { items } = useLocalRepositories();
  return useQuery({
    ...localNetworkMode,
    queryKey: queryKeys.items.counts(gachaId ?? null),
    queryFn: () => items.countItems({ gachaId }),
  });
}

/** 폴더 id → 기록 수 (폴더 선택 시트). 기록이 없는 폴더는 빠지므로 `?? 0` 으로 읽는다. */
export function useItemCountsByFolder() {
  const { items } = useLocalRepositories();
  return useQuery({
    ...localNetworkMode,
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
    ...localNetworkMode,
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
    ...localNetworkMode,
    mutationFn: (input: CreateItemInput) => items.createItem(input),
    onSuccess: invalidate,
  });
}

export function useUpdateItem() {
  const { items } = useLocalRepositories();
  const invalidate = useInvalidateItems();
  return useMutation({
    ...localNetworkMode,
    mutationFn: ({ id, input }: { id: string; input: UpdateItemInput }) =>
      items.updateItem(id, input),
    onSuccess: invalidate,
  });
}

type SetItemTypeVariables = { id: string; type: ItemType };

function setTypeVariables(m: Mutation) {
  return m.state.variables as SetItemTypeVariables | undefined;
}

/** 저장 중(대기 포함)인 이 아이템의 전환. mutation 캐시는 만든 순서라 마지막이 마지막으로 누른 값이다 */
function pendingSetTypeFilters(id: string): MutationFilters {
  return {
    mutationKey: queryKeys.items.setType,
    status: "pending",
    predicate: (m: Mutation) => setTypeVariables(m)?.id === id,
  };
}

function findPendingTypes(queryClient: QueryClient, id: string): ItemType[] {
  return queryClient
    .getMutationCache()
    .findAll(pendingSetTypeFilters(id))
    .map((m) => setTypeVariables(m)!.type);
}

/**
 * WISH · GET 바꾸기. 모든 호출이 한 scope 라 아이템이 달라도 부른 순서대로 하나씩 저장된다.
 * 같은 아이템의 저장이 뒤에 대기 중이면 다시 읽기(invalidate)는 마지막 저장이 끝날 때 한 번만 한다 (연타할 때 소장률이 중간 값으로 갔다 돌아오지 않게).
 * 태그 원탭 전환은 useToggleItemType · useDisplayedItemType 을 쓴다.
 */
export function useSetItemType() {
  const { items } = useLocalRepositories();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateItems();
  return useMutation({
    ...localNetworkMode,
    mutationKey: queryKeys.items.setType,
    mutationFn: ({ id, type }: SetItemTypeVariables) => items.updateItem(id, { type }),
    // 실패해도 다시 읽는다: 앞선 저장이 다시 읽기를 이 저장에 미뤘을 수 있다
    onSettled: async (_data, _error, { id }) => {
      if (findPendingTypes(queryClient, id).length > 1) return;
      await invalidate();
    },
    scope: { id: "items.setType" },
  });
}

/**
 * 화면에 보일 WISH · GET. 이 아이템의 전환이 저장 중이면 마지막으로 누른 값, 아니면 item.type.
 * mutation 캐시를 읽으므로 같은 아이템을 그리는 모든 화면이 같은 값을 보고, 값이 바뀐 행만 다시 그려진다.
 */
export function useDisplayedItemType(item: Pick<Item, "id" | "type">): ItemType {
  const pending = useMutationState({
    filters: pendingSetTypeFilters(item.id),
    select: (m) => setTypeVariables(m)!.type,
  });
  return pending.at(-1) ?? item.type;
}

/**
 * WISH ↔ GET 원탭 전환 (상세 내 아이템 · 내 굿즈 목록의 태그). 돌려주는 함수는 다시 그려도 바뀌지 않는다.
 * 보이는 값(useDisplayedItemType)의 반대로 저장하므로, 빠르게 여러 번 눌러도 마지막으로 보인 상태로 저장된다.
 * 저장이 실패하면 onError 를 부르고 저장된 상태로 돌아간다. 부른 화면이 사라진 뒤의 실패에는 onError 를 부르지 않는다.
 */
export function useToggleItemType({ onError }: { onError?: (error: unknown) => void } = {}) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useSetItemType();
  const onErrorRef = useRef(onError);
  const mounted = useRef(false);
  useEffect(() => {
    onErrorRef.current = onError;
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(
    (item: Pick<Item, "id" | "type">) => {
      const shown = findPendingTypes(queryClient, item.id).at(-1) ?? item.type;
      mutateAsync({ id: item.id, type: shown === "GET" ? "WISH" : "GET" }).catch(
        (error: unknown) => {
          if (mounted.current) onErrorRef.current?.(error);
        }
      );
    },
    [queryClient, mutateAsync]
  );
}

export function useDeleteItem() {
  const { items } = useLocalRepositories();
  const invalidate = useInvalidateItems();
  return useMutation({
    ...localNetworkMode,
    mutationFn: (id: string) => items.deleteItem(id),
    onSuccess: invalidate,
  });
}
