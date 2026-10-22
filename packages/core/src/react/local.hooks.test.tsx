// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { collectionRate } from "../collection";
import type { Repositories } from "../repositories";
import { useDeleteFolder, useCreateFolder, useFolders } from "./folders.hooks";
import { useCreateItem, useItemCounts, useItems, useSetItemType } from "./items.hooks";
import { CoreProvider } from "./provider";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import { createMemoryLocalRepositories } from "../repositories/local.memory";

afterEach(cleanup);

function setup(
  repositories: Repositories = {
    gacha: createMemoryGachaRepository([]),
    ...createMemoryLocalRepositories(),
  }
) {
  // 앱과 같은 staleTime 을 두어야 invalidate 없이는 다시 읽지 않는다는 것까지 확인된다
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider repositories={repositories} queryClient={queryClient}>
      {children}
    </CoreProvider>
  );
  return { wrapper };
}

describe("로컬 기록 훅", () => {
  it("훅으로 아이템을 추가하면 상세 목록 · 홈 소장률에 바로 반영된다", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        detail: useItems({ gachaId: "g1" }),
        counts: useItemCounts(),
        create: useCreateItem(),
        setType: useSetItemType(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.counts.isSuccess).toBe(true));
    expect(result.current.detail.data).toEqual([]);

    let created: Awaited<ReturnType<typeof result.current.create.mutateAsync>>;
    await act(async () => {
      created = await result.current.create.mutateAsync({ gachaId: "g1", type: "WISH", name: "a" });
      await result.current.create.mutateAsync({ gachaId: "g1", type: "GET", name: "b" });
    });
    await waitFor(() => expect(result.current.detail.data).toHaveLength(2));
    expect(result.current.counts.data).toEqual({ wish: 1, get: 1 });
    expect(collectionRate(result.current.counts.data!)).toBe(50);

    await act(() => result.current.setType.mutateAsync({ id: created.id, type: "GET" }));
    await waitFor(() => expect(result.current.counts.data).toEqual({ wish: 0, get: 2 }));
  });

  it("저장 실패는 mutation 의 error 로 그대로 올라온다", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreateItem(), { wrapper });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ gachaId: "g1", type: "WISH", name: " " })
      ).rejects.toThrow();
    });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });

  it("폴더를 지우면 폴더 목록과, 기본 폴더로 옮겨진 기록 목록이 같이 바뀐다", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        folders: useFolders(),
        createFolder: useCreateFolder(),
        deleteFolder: useDeleteFolder(),
        createItem: useCreateItem(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.folders.data).toHaveLength(1));
    const defaultId = result.current.folders.data![0]!.id;

    let folderId = "";
    await act(async () => {
      folderId = (await result.current.createFolder.mutateAsync("가방")).id;
      await result.current.createItem.mutateAsync({
        gachaId: "g1",
        type: "GET",
        name: "a",
        folderId,
      });
    });
    await waitFor(() => expect(result.current.folders.data).toHaveLength(2));

    const inDefault = renderHook(() => useItems({ folderId: defaultId }), { wrapper });
    await waitFor(() => expect(inDefault.result.current.data).toEqual([]));

    await act(() => result.current.deleteFolder.mutateAsync(folderId));
    await waitFor(() => expect(result.current.folders.data).toHaveLength(1));
    await waitFor(() => expect(inDefault.result.current.data).toHaveLength(1));
  });

  it("items · folders 저장소를 넘기지 않은 Provider 에서는 던진다", () => {
    const { wrapper } = setup({ gacha: createMemoryGachaRepository([]) });
    expect(() => renderHook(() => useFolders(), { wrapper })).toThrow(/items · folders/);
  });
});

describe("collectionRate", () => {
  it("GET ÷ 전체 × 100, 정수 버림. 기록이 없으면 0", () => {
    expect(collectionRate({ wish: 0, get: 0 })).toBe(0);
    expect(collectionRate({ wish: 2, get: 1 })).toBe(33);
    expect(collectionRate({ wish: 1, get: 2 })).toBe(66);
    expect(collectionRate({ wish: 0, get: 3 })).toBe(100);
  });
});
