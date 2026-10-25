// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { gachaCollection } from "../collection";
import { useCreateItem, useItemCounts, useItems, useSetItemType } from "./items.hooks";
import { CoreProvider } from "./provider";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import { createMemoryLocalRepositories } from "../repositories/local.memory";

afterEach(cleanup);

function setup() {
  // 앱과 같은 staleTime: invalidate 없이는 다시 읽지 않는다
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  const repositories = {
    gacha: createMemoryGachaRepository([]),
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
});
