// @vitest-environment happy-dom
import { onlineManager, QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useGachaList } from "./gacha.hooks";
import { useIsOnline } from "./network";
import { CoreProvider } from "./provider";
import { useAddRecentSearch, useRecentGacha, useRecentSearches } from "./recent.hooks";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import { createMemoryLocalRepositories } from "../repositories/local.memory";
import {
  createMemoryKeyValueStorage,
  createStorageRecentRepository,
} from "../repositories/recent.storage";

afterEach(() => {
  cleanup();
  onlineManager.setOnline(true);
});

// 저장소 · QueryClient 는 테스트마다 한 번만 만든다 (wrapper 안에서 만들면 다시 렌더될 때 저장소가 비워진다)
function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const repositories = {
    gacha: createMemoryGachaRepository([]),
    ...createMemoryLocalRepositories(),
    recent: createStorageRecentRepository(createMemoryKeyValueStorage()),
  };
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <CoreProvider repositories={repositories} queryClient={queryClient}>
        {children}
      </CoreProvider>
    );
  };
}

describe("오프라인", () => {
  it("서버 쿼리는 멈춰 있다가 다시 연결되면 저절로 불러온다", async () => {
    act(() => onlineManager.setOnline(false));
    const { result } = renderHook(() => ({ list: useGachaList(), online: useIsOnline() }), {
      wrapper: setup(),
    });
    await waitFor(() => expect(result.current.list.isPaused).toBe(true));
    expect(result.current.list.isLoading).toBe(false);
    expect(result.current.online).toBe(false);

    act(() => onlineManager.setOnline(true));
    await waitFor(() => expect(result.current.list.data).toEqual([]));
    expect(result.current.online).toBe(true);
  });

  // 로컬 기록 훅은 local.hooks.test 가 오프라인으로 돌며 지킨다. 최근 기록 훅은 여기서 지킨다.
  it("최근 기록(기기 저장소)은 오프라인에서도 읽고 저장한다", async () => {
    act(() => onlineManager.setOnline(false));
    const { result } = renderHook(
      () => ({ searches: useRecentSearches(), add: useAddRecentSearch(), gacha: useRecentGacha() }),
      { wrapper: setup() }
    );
    await waitFor(() => expect(result.current.searches.data).toEqual([]));
    // id 목록이 비면 서버 쿼리와 상관없이 빈 목록이다
    await waitFor(() => expect(result.current.gacha.data).toEqual([]));

    await act(() => result.current.add.mutateAsync("루나"));
    await waitFor(() => expect(result.current.searches.data).toEqual(["루나"]));
  });
});
