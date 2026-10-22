// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { collectionRate } from "../collection";
import type { Repositories } from "../repositories";
import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useIsFolderNameTaken,
  useRenameFolder,
} from "./folders.hooks";
import {
  useCreateItem,
  useDeleteItem,
  useIsItemNameTaken,
  useItem,
  useItemCounts,
  useItems,
  useSetItemType,
  useUpdateItem,
} from "./items.hooks";
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
  // staleTime 을 무한으로 두어, 쓰기 뒤에 값이 바뀌면 그것이 invalidate 덕분임을 보장한다
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider repositories={repositories} queryClient={queryClient}>
      {children}
    </CoreProvider>
  );
  return { wrapper, repositories };
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

describe("기록 하나 · 수정 · 삭제 훅", () => {
  it("useItem: id 가 없으면 요청하지 않고, 수정하면 새 값을 읽는다", async () => {
    const { wrapper, repositories } = setup();
    const getItem = vi.spyOn(repositories.items!, "getItem");
    const empty = renderHook(() => useItem(undefined), { wrapper });
    expect(empty.result.current.fetchStatus).toBe("idle");
    expect(getItem).not.toHaveBeenCalled();

    const item = await repositories.items!.createItem({ gachaId: "g1", type: "WISH", name: "a" });
    const { result } = renderHook(() => ({ item: useItem(item.id), update: useUpdateItem() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.item.data?.name).toBe("a"));

    await act(() => result.current.update.mutateAsync({ id: item.id, input: { memo: "메모" } }));
    await waitFor(() => expect(result.current.item.data?.memo).toBe("메모"));
  });

  it("useItem: 없는 id 면 data 는 null", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useItem("nope"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("useUpdateItem: 폴더를 옮기면 폴더별 목록이 바뀐다", async () => {
    const { wrapper, repositories } = setup();
    const folder = await repositories.folders!.createFolder("가방");
    const item = await repositories.items!.createItem({ gachaId: "g1", type: "WISH", name: "a" });
    const { result } = renderHook(
      () => ({ inFolder: useItems({ folderId: folder.id }), update: useUpdateItem() }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.inFolder.data).toEqual([]));

    await act(() =>
      result.current.update.mutateAsync({ id: item.id, input: { folderId: folder.id } })
    );
    await waitFor(() => expect(result.current.inFolder.data).toHaveLength(1));
  });

  it("useUpdateItem: 실패하면 error 로 올라오고 목록은 그대로", async () => {
    const { wrapper, repositories } = setup();
    const item = await repositories.items!.createItem({ gachaId: "g1", type: "WISH", name: "a" });
    const { result } = renderHook(() => ({ list: useItems(), update: useUpdateItem() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.list.data).toHaveLength(1));
    await act(async () => {
      await expect(
        result.current.update.mutateAsync({ id: item.id, input: { folderId: "nope" } })
      ).rejects.toThrow();
    });
    await waitFor(() => expect(result.current.update.error).toBeInstanceOf(Error));
    expect(result.current.list.data?.[0]?.folderId).toBe(item.folderId);
  });

  it("useDeleteItem: 지우면 목록 · 개수에서 빠진다", async () => {
    const { wrapper, repositories } = setup();
    const item = await repositories.items!.createItem({ gachaId: "g1", type: "GET", name: "a" });
    const { result } = renderHook(
      () => ({
        list: useItems({ gachaId: "g1" }),
        counts: useItemCounts(),
        remove: useDeleteItem(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.counts.data).toEqual({ wish: 0, get: 1 }));

    await act(() => result.current.remove.mutateAsync(item.id));
    await waitFor(() => expect(result.current.list.data).toEqual([]));
    expect(result.current.counts.data).toEqual({ wish: 0, get: 0 });
  });
});

describe("이름 중복 검사 훅", () => {
  it("useIsItemNameTaken: gachaId 가 없거나 이름이 비면(공백뿐 포함) 요청하지 않는다", async () => {
    const { wrapper, repositories } = setup();
    const check = vi.spyOn(repositories.items!, "isItemNameTaken");
    const { result } = renderHook(
      () => [
        useIsItemNameTaken(undefined, "토끼"),
        useIsItemNameTaken("g1", ""),
        useIsItemNameTaken("g1", "  "),
      ],
      { wrapper }
    );
    for (const query of result.current) expect(query.fetchStatus).toBe("idle");
    expect(check).not.toHaveBeenCalled();
  });

  it("useIsItemNameTaken: 같은 가챠에 저장하면 true 로 바뀌고, 다른 가챠는 false", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        same: useIsItemNameTaken("g1", " 토끼 "),
        other: useIsItemNameTaken("g2", "토끼"),
        create: useCreateItem(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.same.data).toBe(false));

    await act(() =>
      result.current.create.mutateAsync({ gachaId: "g1", type: "WISH", name: "토끼" })
    );
    await waitFor(() => expect(result.current.same.data).toBe(true));
    await waitFor(() => expect(result.current.other.data).toBe(false));
  });

  it("useIsItemNameTaken: 수정 중인 기록 자신은 빼고, 지우면 다시 false", async () => {
    const { wrapper, repositories } = setup();
    const item = await repositories.items!.createItem({
      gachaId: "g1",
      type: "WISH",
      name: "토끼",
    });
    const { result } = renderHook(
      () => ({
        self: useIsItemNameTaken("g1", "토끼", item.id),
        any: useIsItemNameTaken("g1", "토끼"),
        remove: useDeleteItem(),
      }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.any.data).toBe(true));
    expect(result.current.self.data).toBe(false);

    await act(() => result.current.remove.mutateAsync(item.id));
    await waitFor(() => expect(result.current.any.data).toBe(false));
  });

  it("useIsFolderNameTaken: 빈 이름은 요청하지 않고, 이름을 바꾸면 결과가 갱신된다", async () => {
    const { wrapper, repositories } = setup();
    const check = vi.spyOn(repositories.folders!, "isFolderNameTaken");
    const folder = await repositories.folders!.createFolder("가방");
    const { result } = renderHook(
      () => ({
        empty: useIsFolderNameTaken(" "),
        oldName: useIsFolderNameTaken("가방"),
        self: useIsFolderNameTaken("가방", folder.id),
        rename: useRenameFolder(),
      }),
      { wrapper }
    );
    expect(result.current.empty.fetchStatus).toBe("idle");
    await waitFor(() => expect(result.current.oldName.data).toBe(true));
    expect(result.current.self.data).toBe(false);
    expect(check).not.toHaveBeenCalledWith(" ", undefined);

    await act(() => result.current.rename.mutateAsync({ id: folder.id, name: "책상" }));
    await waitFor(() => expect(result.current.oldName.data).toBe(false));
  });
});

describe("폴더 이름 변경 훅", () => {
  it("useRenameFolder: 바꾸면 폴더 목록이 바뀌고, 기본 폴더는 error 로 올라온다", async () => {
    const { wrapper, repositories } = setup();
    const folder = await repositories.folders!.createFolder("가방");
    const { result } = renderHook(() => ({ folders: useFolders(), rename: useRenameFolder() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.folders.data).toHaveLength(2));
    const defaultId = result.current.folders.data![0]!.id;

    await act(() => result.current.rename.mutateAsync({ id: folder.id, name: "책상" }));
    await waitFor(() => expect(result.current.folders.data?.[1]?.name).toBe("책상"));

    await act(async () => {
      await expect(
        result.current.rename.mutateAsync({ id: defaultId, name: "x" })
      ).rejects.toThrow();
    });
    await waitFor(() => expect(result.current.rename.error).toBeInstanceOf(Error));
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
