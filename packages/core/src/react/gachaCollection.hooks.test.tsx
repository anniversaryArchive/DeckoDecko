// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { gachaCollection } from "../collection";
import type { GachaRepository } from "../repositories/gacha";
import type { GachaDetail } from "../types";
import { useGachaCollections } from "./gachaCollection.hooks";
import {
  useCreateItem,
  useDeleteItem,
  useItemCounts,
  useItems,
  useSetItemType,
} from "./items.hooks";
import { CoreProvider } from "./provider";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import { createMemoryLocalRepositories } from "../repositories/local.memory";

afterEach(cleanup);

function setup(catalog: GachaDetail[] = [], gacha = createMemoryGachaRepository(catalog)) {
  // 앱과 같은 staleTime: invalidate 없이는 다시 읽지 않는다
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  const repositories = {
    gacha,
    ...createMemoryLocalRepositories(),
  };
  return ({ children }: { children: ReactNode }) => (
    <CoreProvider repositories={repositories} queryClient={queryClient}>
      {children}
    </CoreProvider>
  );
}

describe("가챠 상세의 내 아이템 · 소장률", () => {
  it("상세에서 아이템을 추가하면 그 가챠의 목록과 소장률이 바로 바뀌고, 다른 가챠 기록은 섞이지 않는다", async () => {
    const { result } = renderHook(
      () => ({
        list: useItems({ gachaId: "g1" }),
        counts: useItemCounts("g1"),
        create: useCreateItem(),
      }),
      { wrapper: setup() }
    );
    await waitFor(() => expect(result.current.counts.isSuccess).toBe(true));
    expect(gachaCollection(result.current.counts.data!, 6).missing).toBe(6);

    await act(async () => {
      await result.current.create.mutateAsync({ gachaId: "g1", type: "GET", name: "a" });
      await result.current.create.mutateAsync({ gachaId: "g1", type: "WISH", name: "b" });
      await result.current.create.mutateAsync({ gachaId: "g2", type: "GET", name: "c" });
    });

    await waitFor(() => expect(result.current.list.data).toHaveLength(2));
    expect(result.current.counts.data).toEqual({ wish: 1, get: 1 });
    expect(gachaCollection(result.current.counts.data!, 6)).toMatchObject({
      get: 1,
      wish: 1,
      missing: 4,
      rate: 16,
    });
  });

  it("WISH ↔ GET 을 바꾸면 소장률이 바로 바뀌고, 없는 기록을 바꾸려 하면 실패하고 그대로 둔다", async () => {
    const { result } = renderHook(
      () => ({
        counts: useItemCounts("g1"),
        create: useCreateItem(),
        setType: useSetItemType(),
      }),
      { wrapper: setup() }
    );
    await waitFor(() => expect(result.current.counts.isSuccess).toBe(true));

    let id = "";
    await act(async () => {
      id = (await result.current.create.mutateAsync({ gachaId: "g1", type: "WISH", name: "a" })).id;
    });
    await waitFor(() => expect(result.current.counts.data).toEqual({ wish: 1, get: 0 }));

    await act(async () => {
      await result.current.setType.mutateAsync({ id, type: "GET" });
    });
    await waitFor(() => expect(result.current.counts.data).toEqual({ wish: 0, get: 1 }));
    expect(gachaCollection(result.current.counts.data!, 2).rate).toBe(50);

    await act(async () => {
      await expect(
        result.current.setType.mutateAsync({ id: "missing", type: "WISH" })
      ).rejects.toThrow();
    });
    expect(result.current.counts.data).toEqual({ wish: 0, get: 1 });
  });

  it("기록을 삭제하면 그 가챠의 목록과 소장률에서 바로 빠진다", async () => {
    const { result } = renderHook(
      () => ({
        list: useItems({ gachaId: "g1" }),
        counts: useItemCounts("g1"),
        create: useCreateItem(),
        remove: useDeleteItem(),
      }),
      { wrapper: setup() }
    );
    await waitFor(() => expect(result.current.counts.isSuccess).toBe(true));

    let id = "";
    await act(async () => {
      id = (await result.current.create.mutateAsync({ gachaId: "g1", type: "GET", name: "a" })).id;
      await result.current.create.mutateAsync({ gachaId: "g1", type: "WISH", name: "b" });
    });
    await waitFor(() => expect(result.current.list.data).toHaveLength(2));

    await act(async () => {
      await result.current.remove.mutateAsync(id);
    });
    await waitFor(() => expect(result.current.list.data).toHaveLength(1));
    expect(result.current.list.data?.[0]?.name).toBe("b");
    expect(result.current.counts.data).toEqual({ wish: 1, get: 0 });
    expect(gachaCollection(result.current.counts.data!, 6).rate).toBe(0);
  });

  it("추가가 실패하면(없는 폴더) 목록 · 소장률은 그대로다", async () => {
    const { result } = renderHook(
      () => ({
        list: useItems({ gachaId: "g1" }),
        counts: useItemCounts("g1"),
        create: useCreateItem(),
      }),
      { wrapper: setup() }
    );
    await waitFor(() => expect(result.current.counts.isSuccess).toBe(true));
    await act(async () => {
      await result.current.create.mutateAsync({ gachaId: "g1", type: "GET", name: "a" });
    });
    await waitFor(() => expect(result.current.list.data).toHaveLength(1));

    await act(async () => {
      await expect(
        result.current.create.mutateAsync({
          gachaId: "g1",
          type: "WISH",
          name: "b",
          folderId: "missing",
        })
      ).rejects.toThrow();
    });
    expect(result.current.list.data).toHaveLength(1);
    expect(result.current.counts.data).toEqual({ wish: 0, get: 1 });
  });
});

function catalogGacha(id: string, itemCount: number): GachaDetail {
  return {
    id,
    name: id,
    nameKo: null,
    imageUrl: null,
    media: null,
    price: null,
    releaseMonth: null,
    itemCount,
    items: [],
  };
}

describe("useGachaCollections (여러 가챠의 소장률)", () => {
  const catalog = [catalogGacha("g1", 4), catalogGacha("g2", 3), catalogGacha("g0", 0)];

  it("가챠마다 로컬 GET 수 ÷ 원격 라인업 수를 한 번에 돌려주고, 기록이 바뀌면 바로 반영한다", async () => {
    const { result } = renderHook(
      () => ({
        rates: useGachaCollections(["g1", "g2"]),
        create: useCreateItem(),
      }),
      { wrapper: setup(catalog) }
    );
    await waitFor(() => expect(result.current.rates.data).toBeDefined());
    expect(result.current.rates.data!.g1!.collection!.rate).toBe(0);

    await act(async () => {
      await result.current.create.mutateAsync({ gachaId: "g1", type: "GET", name: "a" });
      await result.current.create.mutateAsync({ gachaId: "g1", type: "WISH", name: "b" });
      await result.current.create.mutateAsync({ gachaId: "g2", type: "GET", name: "c" });
    });

    await waitFor(() => expect(result.current.rates.data!.g1!.counts.get).toBe(1));
    expect(result.current.rates.data!.g1).toEqual({
      counts: { wish: 1, get: 1 },
      collection: gachaCollection({ wish: 1, get: 1 }, 4),
    });
    expect(result.current.rates.data!.g1!.collection!.rate).toBe(25);
    expect(result.current.rates.data!.g2!.collection!.rate).toBe(33);
  });

  it("카탈로그에 없거나 라인업이 0 인 가챠는 collection 이 null", async () => {
    const { result } = renderHook(() => useGachaCollections(["g0", "gone"]), {
      wrapper: setup(catalog),
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual({
      g0: { counts: { wish: 0, get: 0 }, collection: null },
      gone: { counts: { wish: 0, get: 0 }, collection: null },
    });
  });

  it("ids 가 비어 있으면 빈 객체", async () => {
    const { result } = renderHook(() => useGachaCollections([]), { wrapper: setup(catalog) });
    await waitFor(() => expect(result.current.data).toEqual({}));
    expect(result.current.isLoading).toBe(false);
  });

  it("렌더마다 새 배열을 넘겨도 내용이 같으면 data 는 같은 객체다", async () => {
    const { result, rerender } = renderHook(({ ids }) => useGachaCollections(ids), {
      wrapper: setup(catalog),
      initialProps: { ids: ["g1", "g2"] },
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const before = result.current.data;
    rerender({ ids: ["g1", "g2"] });
    expect(result.current.data).toBe(before);
  });

  it("가챠가 새로 붙으면 그 라인업이 올 때까지 null 이 아니라 불러오는 중으로 둔다", async () => {
    const base = createMemoryGachaRepository(catalog);
    let release = () => {};
    const gacha: GachaRepository = {
      ...base,
      async listGachaByIds(ids) {
        if (ids.includes("g2")) await new Promise<void>((resolve) => (release = resolve));
        return base.listGachaByIds(ids);
      },
    };
    const { result, rerender } = renderHook(({ ids }) => useGachaCollections(ids), {
      wrapper: setup(catalog, gacha),
      initialProps: { ids: ["g1"] },
    });
    await waitFor(() => expect(result.current.data).toBeDefined());

    rerender({ ids: ["g1", "g2"] });
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.data).toBeUndefined();

    act(() => release());
    await waitFor(() => expect(result.current.data?.g2?.collection?.total).toBe(3));
    expect(result.current.isLoading).toBe(false);
  });
});
