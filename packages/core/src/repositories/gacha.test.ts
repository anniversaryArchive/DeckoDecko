import { describe, expect, it } from "vitest";

import { releaseStatus, resolveGachaFilter, toYearMonth } from "./gacha";

describe("resolveGachaFilter", () => {
  const empty = { release: "all", mediaId: null, priceMin: null, priceMax: null };

  it("생략 · undefined · null · 빈 객체는 모두 같은 기본값 (쿼리 키가 하나로 모인다)", () => {
    expect(resolveGachaFilter()).toEqual(empty);
    expect(resolveGachaFilter({})).toEqual(empty);
    expect(
      resolveGachaFilter({
        release: undefined,
        mediaId: null,
        priceMin: undefined,
        priceMax: null,
      })
    ).toEqual(empty);
  });

  it("빈 문자열 mediaId 는 작품 조건 없음", () => {
    expect(resolveGachaFilter({ mediaId: "" }).mediaId).toBeNull();
  });

  it("가격이 유한한 숫자가 아니면 null", () => {
    for (const v of [Number.NaN, Infinity, -Infinity]) {
      expect(resolveGachaFilter({ priceMin: v, priceMax: v }), String(v)).toEqual(empty);
    }
  });

  it("준 값은 그대로 둔다 (0 원도 조건)", () => {
    expect(
      resolveGachaFilter({ release: "new", mediaId: "m1", priceMin: 0, priceMax: 500 })
    ).toEqual({ release: "new", mediaId: "m1", priceMin: 0, priceMax: 500 });
  });
});

describe("toYearMonth", () => {
  it("기기 시간대의 연 · 월을 YYYY-MM 으로, 한 자리 달은 0 을 채운다", () => {
    expect(toYearMonth(new Date(2026, 0, 1))).toBe("2026-01");
    expect(toYearMonth(new Date(2026, 9, 31, 23, 59))).toBe("2026-10");
    expect(toYearMonth(new Date(2026, 11, 31))).toBe("2026-12");
  });
});

describe("releaseStatus", () => {
  it("이번 달은 new, 다음 달 이후는 upcoming, 지난 달 · 모름은 null", () => {
    expect(releaseStatus("2026-10", "2026-10")).toBe("new");
    expect(releaseStatus("2026-11", "2026-10")).toBe("upcoming");
    expect(releaseStatus("2027-01", "2026-12")).toBe("upcoming");
    expect(releaseStatus("2026-09", "2026-10")).toBeNull();
    expect(releaseStatus(null, "2026-10")).toBeNull();
  });
});
