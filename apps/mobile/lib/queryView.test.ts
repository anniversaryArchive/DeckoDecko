import { describe, expect, it } from "vitest";

import { queryView, type QueryLike } from "./queryView";

function query<T>(overrides: Partial<QueryLike<T>>): QueryLike<T> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: () => {},
    ...overrides,
  };
}

describe("queryView", () => {
  it("오프라인으로 멈췄고 받은 값이 없으면 offline (멈춘 쿼리는 isLoading 이 false)", () => {
    expect(queryView(query({ isPaused: true }))).toBe("offline");
  });

  it("오프라인으로 멈췄을 때 이전 검색어의 결과만 들고 있으면 offline", () => {
    expect(queryView(query({ isPaused: true, data: [1], isPlaceholderData: true }))).toBe(
      "offline"
    );
  });

  it("오프라인이어도 캐시가 있으면 content", () => {
    expect(queryView(query({ isPaused: true, data: [1] }))).toBe("content");
  });

  it("'없음'(null)으로 확정된 캐시는 오프라인이어도 empty", () => {
    expect(queryView(query({ isPaused: true, data: null }))).toBe("empty");
  });

  it("로딩 · 이전 결과 대신 보여 주는 중이면 loading", () => {
    expect(queryView(query({ isLoading: true }))).toBe("loading");
    expect(queryView(query({ data: [1], isPlaceholderData: true }))).toBe("loading");
  });

  it("에러면 error, 비었으면 empty, 아니면 content", () => {
    expect(queryView(query({ isError: true }))).toBe("error");
    expect(queryView(query<number[]>({ data: [] }), (list) => list.length === 0)).toBe("empty");
    expect(queryView(query<number[]>({ data: [1] }), (list) => list.length === 0)).toBe("content");
  });
});
