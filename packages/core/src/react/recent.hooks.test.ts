import { describe, expect, it } from "vitest";

import { combineRecentGacha } from "./recent.hooks";

const done = <T>(data: T) => ({ data, isLoading: false, isError: false });
const loading = { data: undefined, isLoading: true, isError: false };
const failed = { data: undefined, isLoading: false, isError: true };

describe("combineRecentGacha", () => {
  it("목록 쿼리의 결과를 그대로 쓴다", () => {
    expect(combineRecentGacha(done(["b", "a"]), done(["B", "A"]))).toEqual(done(["B", "A"]));
  });

  it("기록이 없으면 빈 목록 (불러오는 중이 아니다)", () => {
    expect(combineRecentGacha(done([]), done(undefined))).toEqual(done([]));
  });

  it("전체 삭제 직후 목록 쿼리가 이전 목록을 들고 있어도 빈 목록", () => {
    expect(combineRecentGacha(done([]), done(["A"]))).toEqual(done([]));
  });

  it("id 목록을 불러오는 중이면 data 가 없다", () => {
    expect(combineRecentGacha(loading, done(undefined))).toEqual(loading);
  });

  it("목록을 불러오는 중이면 로딩", () => {
    expect(combineRecentGacha(done(["a"]), loading)).toEqual(loading);
  });

  it("id 목록을 못 읽으면 에러", () => {
    expect(combineRecentGacha(failed, done(undefined))).toEqual(failed);
  });

  it("목록 조회가 실패하면 에러", () => {
    expect(combineRecentGacha(done(["a"]), failed)).toEqual(failed);
  });
});
