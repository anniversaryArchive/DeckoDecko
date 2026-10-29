import { describe, expect, it } from "vitest";

import { toItemCounts, toItemCountsBy } from "./itemCounts";

describe("toItemCounts", () => {
  it("기록 한 건은 1, group by 행은 n 만큼 센다", () => {
    expect(toItemCounts([])).toEqual({ wish: 0, get: 0 });
    expect(toItemCounts([{ type: "WISH" }, { type: "GET" }, { type: "GET" }])).toEqual({
      wish: 1,
      get: 2,
    });
    expect(toItemCounts([{ type: "GET", n: 4 }])).toEqual({ wish: 0, get: 4 });
  });
});

describe("toItemCountsBy", () => {
  it("key 마다 접고, 행이 없는 key 는 빠진다", () => {
    const rows = [
      { gachaId: "g1", type: "WISH" as const, n: 1 },
      { gachaId: "g1", type: "GET" as const, n: 2 },
      { gachaId: "g2", type: "GET" as const, n: 3 },
    ];
    expect(toItemCountsBy(rows, (r) => r.gachaId)).toEqual({
      g1: { wish: 1, get: 2 },
      g2: { wish: 0, get: 3 },
    });
  });
});
