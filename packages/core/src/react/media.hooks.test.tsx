// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Repositories } from "../repositories";
import { useMediaSearch } from "./media.hooks";
import { CoreProvider } from "./provider";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import type { MediaEntry } from "../repositories/media";
import { createMemoryMediaRepository } from "../repositories/media.memory";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const seed: MediaEntry[] = [
  { id: "m-1", title: "별의 숲", titleJa: "星の森", titleEn: null, kind: null, aliases: ["별숲"] },
  { id: "m-2", title: "별빛 카페", titleJa: null, titleEn: null, kind: null },
];

function setup(withMedia = true) {
  const media = createMemoryMediaRepository(seed);
  const repositories: Repositories = {
    gacha: createMemoryGachaRepository([]),
    ...(withMedia && { media }),
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider repositories={repositories} queryClient={queryClient}>
      {children}
    </CoreProvider>
  );
  return { wrapper, media, queryClient };
}

const ids = (list: { id: string }[] | undefined) => list?.map((m) => m.id);

describe("useMediaSearch", () => {
  it("빈 검색어여도 목록을 미리 받고 [] 를 돌려준다", async () => {
    const { wrapper, media } = setup();
    const list = vi.spyOn(media, "listMedia");
    const { result } = renderHook(() => useMediaSearch(" "), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("목록은 한 번만 받고, 검색어를 바꾸면 받은 목록에서 바로 거른다", async () => {
    const { wrapper, media } = setup();
    const list = vi.spyOn(media, "listMedia");
    const { result, rerender } = renderHook(({ keyword }) => useMediaSearch(keyword), {
      wrapper,
      initialProps: { keyword: "별" },
    });
    await waitFor(() => expect(ids(result.current.data)).toEqual(["m-1", "m-2"]));

    rerender({ keyword: " 별숲 " });
    expect(ids(result.current.data)).toEqual(["m-1"]);
    rerender({ keyword: "별빛" });
    expect(ids(result.current.data)).toEqual(["m-2"]);
    rerender({ keyword: "" });
    expect(result.current.data).toEqual([]);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("limit 만큼만 돌려준다", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useMediaSearch("별", 1), { wrapper });
    await waitFor(() => expect(ids(result.current.data)).toEqual(["m-1"]));
  });

  it("목록을 다시 받으면 새 작품도 찾는다", async () => {
    const { wrapper, media, queryClient } = setup();
    const { result } = renderHook(() => useMediaSearch("새 작품"), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual([]));

    vi.spyOn(media, "listMedia").mockResolvedValueOnce([
      ...seed,
      { id: "m-3", title: "새 작품", titleJa: null, titleEn: null, kind: null },
    ]);
    await queryClient.invalidateQueries({ queryKey: ["media"] });
    await waitFor(() => expect(ids(result.current.data)).toEqual(["m-3"]));
  });

  it("작품 저장소를 넘기지 않으면 요청하지 않는다", () => {
    const { result } = renderHook(() => useMediaSearch("별"), { wrapper: setup(false).wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
