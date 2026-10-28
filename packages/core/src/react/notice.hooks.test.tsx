// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { createMemoryGachaRepository } from "../repositories/gacha.memory";
import type { NoticeRepository } from "../repositories/notice";
import { createMemoryNoticeRepository } from "../repositories/notice.memory";
import type { Notice } from "../types";
import { useHomeNotices, useNotice, useNotices } from "./notice.hooks";
import { CoreProvider } from "./provider";

afterEach(cleanup);

const seed: Notice[] = [
  { id: "a", title: "A", content: "", isFixed: false, createdAt: "2026-10-20T00:00:00Z" },
  { id: "b", title: "B", content: "", isFixed: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "fixed", title: "F", content: "", isFixed: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "fixed-new", title: "FN", content: "", isFixed: true, createdAt: "2026-02-01T00:00:00Z" },
  { id: "fixed-old", title: "FO", content: "", isFixed: true, createdAt: "2025-12-01T00:00:00Z" },
];

function wrapperWith(notice?: NoticeRepository) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <CoreProvider
        repositories={{ gacha: createMemoryGachaRepository([]), notice }}
        queryClient={queryClient}
      >
        {children}
      </CoreProvider>
    );
  };
}

const wrapper = wrapperWith(createMemoryNoticeRepository(seed));

/** 항상 실패하는 저장소 (네트워크 오류 흉내) */
const failing: NoticeRepository = {
  listNotices: () => Promise.reject(new Error("offline")),
  getNotice: () => Promise.reject(new Error("offline")),
};

describe("공지 훅", () => {
  it("useNotices: 고정 공지 먼저, 그다음 최신순", async () => {
    const { result } = renderHook(() => useNotices(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((n) => n.id)).toEqual([
      "fixed-new",
      "fixed",
      "fixed-old",
      "b",
      "a",
    ]);
  });

  it("useHomeNotices: 고정 공지만 최신순 2개 (고정 아닌 최신 공지는 빠진다)", async () => {
    const { result } = renderHook(() => useHomeNotices(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((n) => n.id)).toEqual(["fixed-new", "fixed"]);
  });

  it("useHomeNotices: 고정 공지가 없으면 빈 배열 (띠를 숨긴다)", async () => {
    const onlyNormal = wrapperWith(createMemoryNoticeRepository(seed.filter((n) => !n.isFixed)));
    const { result } = renderHook(() => useHomeNotices(), { wrapper: onlyNormal });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useNotices: limit 을 생략하면 기본 개수(20)까지 전부", async () => {
    const { result } = renderHook(() => useNotices(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(seed.length);
  });

  it("useNotices · useNotice: 저장소가 실패하면 에러 상태", async () => {
    const failingWrapper = wrapperWith(failing);
    const list = renderHook(() => useNotices(), { wrapper: failingWrapper });
    const detail = renderHook(() => useNotice("a"), { wrapper: failingWrapper });
    await waitFor(() => expect(list.result.current.isError).toBe(true));
    await waitFor(() => expect(detail.result.current.isError).toBe(true));
  });

  it("useNotice: 없는 id 면 null", async () => {
    const { result } = renderHook(() => useNotice("missing"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("공지 저장소를 넘기지 않았으면 요청하지 않고 공지 없음으로 끝난다", () => {
    const noNotice = wrapperWith(undefined);
    const list = renderHook(() => useNotices(), { wrapper: noNotice });
    const home = renderHook(() => useHomeNotices(), { wrapper: noNotice });
    const detail = renderHook(() => useNotice("a"), { wrapper: noNotice });
    for (const { result } of [list, home, detail]) {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe("idle");
      expect(result.current.data).toBeUndefined();
    }
  });

  it("useNotice: id 가 없으면 요청하지 않고, 있으면 하나를 가져온다", async () => {
    const empty = renderHook(() => useNotice(undefined), { wrapper });
    expect(empty.result.current.isLoading).toBe(false);
    expect(empty.result.current.fetchStatus).toBe("idle");

    const { result } = renderHook(() => useNotice("a"), { wrapper });
    await waitFor(() => expect(result.current.data?.title).toBe("A"));
  });
});
