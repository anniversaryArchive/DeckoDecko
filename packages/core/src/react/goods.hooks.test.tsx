// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockCatalog } from "../mocks";
import { useGachasByIds } from "./gacha.hooks";
import { useGoodsViewMode, useSetGoodsViewMode } from "./preferences.hooks";
import { CoreProvider } from "./provider";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import { createStoragePreferencesRepository } from "../repositories/preferences.storage";
import { createMemoryKeyValueStorage } from "../repositories/recent.storage";

afterEach(cleanup);

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  const gacha = createMemoryGachaRepository(mockCatalog);
  const storage = createMemoryKeyValueStorage();
  const repositories = { gacha, preferences: createStoragePreferencesRepository(storage) };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider repositories={repositories} queryClient={queryClient}>
      {children}
    </CoreProvider>
  );
  return { wrapper, gacha, storage };
}

describe("내 굿즈 훅", () => {
  it("useGachasByIds: 중복 · 순서와 관계없이 한 번 요청하고 id → 가챠 Map 으로 돌려준다", async () => {
    const { wrapper, gacha } = setup();
    const spy = vi.spyOn(gacha, "listGachaByIds");
    const [a, b] = mockCatalog;
    const { result, rerender } = renderHook(({ ids }) => useGachasByIds(ids), {
      wrapper,
      initialProps: { ids: [b!.id, a!.id, b!.id] },
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.get(a!.id)?.name).toBe(a!.name);
    expect(result.current.data?.size).toBe(2);
    rerender({ ids: [a!.id, b!.id] });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("useGachasByIds: 빈 목록이면 요청하지 않는다", () => {
    const { wrapper, gacha } = setup();
    const spy = vi.spyOn(gacha, "listGachaByIds");
    const { result } = renderHook(() => useGachasByIds([]), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it("보기 방식: 처음엔 풀어보기, 바꾸면 바로 바뀌고 저장된다", async () => {
    const { wrapper, storage } = setup();
    const { result } = renderHook(
      () => ({ mode: useGoodsViewMode(), set: useSetGoodsViewMode() }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.mode.data).toBe("items"));
    act(() => result.current.set.mutate("gachas"));
    await waitFor(() => expect(result.current.mode.data).toBe("gachas"));
    await waitFor(() => expect(result.current.set.isSuccess).toBe(true));
    expect(Object.values(storage.snapshot())).toEqual(["gachas"]);
  });
});
