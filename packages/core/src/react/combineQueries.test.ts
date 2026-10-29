import { describe, expect, it, vi } from "vitest";

import { combineQueryStatus, refetchQueries } from "./combineQueries";

const query = (state: { isLoading?: boolean; isError?: boolean } = {}) => ({
  isLoading: false,
  isError: false,
  ...state,
  refetch: vi.fn(async () => undefined),
});

describe("combineQueryStatus", () => {
  it("하나라도 불러오는 중 · 실패면 그 상태", () => {
    expect(combineQueryStatus([query(), query()])).toEqual({ isLoading: false, isError: false });
    expect(combineQueryStatus([query(), query({ isLoading: true })]).isLoading).toBe(true);
    expect(combineQueryStatus([query({ isError: true }), query()]).isError).toBe(true);
  });
});

describe("refetchQueries", () => {
  it("실패한 쿼리를 모두 다시 부르고, 성공한 것은 두지 않는다", async () => {
    const a = query({ isError: true });
    const b = query({ isError: true });
    const c = query();
    await refetchQueries([a, b, c])();
    expect(a.refetch).toHaveBeenCalledOnce();
    expect(b.refetch).toHaveBeenCalledOnce();
    expect(c.refetch).not.toHaveBeenCalled();
  });

  it("실패한 것이 없으면 전부 다시 부른다", async () => {
    const a = query();
    const b = query();
    await refetchQueries([a, b])();
    expect(a.refetch).toHaveBeenCalledOnce();
    expect(b.refetch).toHaveBeenCalledOnce();
  });
});
