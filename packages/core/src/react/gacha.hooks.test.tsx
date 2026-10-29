// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Repositories } from "../repositories";
import type { GachaRepository } from "../repositories/gacha";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import { createMemoryLocalRepositories } from "../repositories/local.memory";
import type { GachaDetail } from "../types";
import { useGachaSearchPages } from "./gacha.hooks";
import { CoreProvider } from "./provider";

afterEach(cleanup);

// 기준 달을 고정해 신상품 · 발매 예정이 실행하는 날에 따라 바뀌지 않게 한다
const NOW = () => new Date(2026, 9, 15);

function gacha(id: string, overrides: Partial<Omit<GachaDetail, "items">> = {}): GachaDetail {
  return {
    id,
    name: `mini-${id}`,
    nameKo: null,
    imageUrl: null,
    media: null,
    price: null,
    releaseMonth: null,
    itemCount: 0,
    items: [],
    ...overrides,
  };
}

function setup(gachaRepository: GachaRepository) {
  const repositories: Repositories = {
    gacha: gachaRepository,
    ...createMemoryLocalRepositories(),
  };
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

const ids = (list: { id: string }[] | undefined) => list?.map((g) => g.id);

describe("useGachaSearchPages", () => {
  it("빈 검색어(공백만)는 요청하지 않는다", async () => {
    const repo = createMemoryGachaRepository([gacha("a")], { now: NOW });
    const spy = vi.spyOn(repo, "searchGacha");
    const { wrapper } = setup(repo);
    const { result } = renderHook(() => useGachaSearchPages("  "), { wrapper });

    await act(async () => {});
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("다음 페이지를 이어 붙이고, 끝까지 받으면 hasNextPage 가 false 다", async () => {
    const seed = Array.from({ length: 23 }, (_, i) => gacha(`g${i + 1}`));
    const { wrapper } = setup(createMemoryGachaRepository(seed, { now: NOW }));
    const { result } = renderHook(() => useGachaSearchPages("mini"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(10);
    expect(result.current.data?.total).toBe(23);
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.items).toHaveLength(20));

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.items).toHaveLength(23));
    expect(result.current.hasNextPage).toBe(false);
    expect(new Set(ids(result.current.data?.items)).size).toBe(23);
  });

  it("필터 · 정렬을 저장소에 넘기고, total 은 필터까지 적용한 개수다", async () => {
    const seed = [
      gacha("cheap", { price: 300, releaseMonth: "2026-10" }),
      gacha("mid", { price: 500, releaseMonth: "2026-10" }),
      gacha("upcoming", { price: 400, releaseMonth: "2026-12" }),
      gacha("unknown", { price: null, releaseMonth: null }),
    ];
    const { wrapper } = setup(createMemoryGachaRepository(seed, { now: NOW }));
    const { result } = renderHook(
      () =>
        useGachaSearchPages("mini", {
          filter: { release: "new", priceMin: 400, priceMax: 500 },
          sort: "priceDesc",
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ids(result.current.data?.items)).toEqual(["mid"]);
    expect(result.current.data?.total).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("필터를 바꾸면 새 결과가 올 때까지 이전 결과를 placeholder 로 들고 있다", async () => {
    const seed = [gacha("cheap", { price: 300 }), gacha("mid", { price: 500 })];
    const memory = createMemoryGachaRepository(seed, { now: NOW });
    let release: () => void = () => {};
    const repo: GachaRepository = {
      ...memory,
      // 두 번째 요청(필터를 바꾼 뒤)만 붙잡아 placeholder 상태를 볼 수 있게 한다
      searchGacha: vi.fn(async (params) => {
        if (params.filter?.priceMin != null) await new Promise<void>((r) => (release = r));
        return memory.searchGacha(params);
      }),
    };
    const { wrapper } = setup(repo);
    const { result, rerender } = renderHook(
      ({ priceMin }: { priceMin: number | null }) =>
        useGachaSearchPages("mini", { filter: { priceMin } }),
      { wrapper, initialProps: { priceMin: null as number | null } }
    );
    await waitFor(() => expect(result.current.data?.total).toBe(2));

    rerender({ priceMin: 400 });
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.total).toBe(2);

    await act(async () => release());
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(ids(result.current.data?.items)).toEqual(["mid"]);
    expect(result.current.data?.total).toBe(1);
  });
});
