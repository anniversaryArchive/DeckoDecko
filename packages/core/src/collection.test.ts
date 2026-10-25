import { describe, expect, it } from "vitest";

import { gachaCollection } from "./collection";

describe("gachaCollection", () => {
  it("가진 수 / 전체 종, 나머지는 WISH · 미등록으로 나눈다", () => {
    expect(gachaCollection({ get: 3, wish: 2 }, 6)).toEqual({
      total: 6,
      get: 3,
      wish: 2,
      missing: 1,
      rate: 50,
    });
  });

  it("비율은 정수 버림", () => {
    expect(gachaCollection({ get: 1, wish: 0 }, 3).rate).toBe(33);
    expect(gachaCollection({ get: 2, wish: 0 }, 3).rate).toBe(66);
    expect(gachaCollection({ get: 6, wish: 0 }, 6).rate).toBe(100);
  });

  it("기록이 없으면 모두 미등록, 0%", () => {
    expect(gachaCollection({ get: 0, wish: 0 }, 5)).toEqual({
      total: 5,
      get: 0,
      wish: 0,
      missing: 5,
      rate: 0,
    });
  });

  it("기록이 종 수를 넘으면 GET 부터 채우고 남는 자리만 WISH 로 센다", () => {
    expect(gachaCollection({ get: 4, wish: 3 }, 6)).toEqual({
      total: 6,
      get: 4,
      wish: 2,
      missing: 0,
      rate: 66,
    });
    expect(gachaCollection({ get: 8, wish: 1 }, 6)).toEqual({
      total: 6,
      get: 6,
      wish: 0,
      missing: 0,
      rate: 100,
    });
  });

  it("라인업이 없으면(0종) 모두 0", () => {
    expect(gachaCollection({ get: 2, wish: 1 }, 0)).toEqual({
      total: 0,
      get: 0,
      wish: 0,
      missing: 0,
      rate: 0,
    });
  });

  it("라인업이 1종이면 GET 한 건으로 100%", () => {
    expect(gachaCollection({ get: 1, wish: 0 }, 1)).toMatchObject({
      get: 1,
      missing: 0,
      rate: 100,
    });
    expect(gachaCollection({ get: 0, wish: 1 }, 1)).toMatchObject({ wish: 1, missing: 0, rate: 0 });
  });

  it("WISH 만 있으면 바는 채워져도 소장률은 0%", () => {
    expect(gachaCollection({ get: 0, wish: 9 }, 6)).toEqual({
      total: 6,
      get: 0,
      wish: 6,
      missing: 0,
      rate: 0,
    });
  });

  it("종 수가 음수 · 소수로 와도 0 이상의 정수로 다룬다", () => {
    expect(gachaCollection({ get: 1, wish: 0 }, -3)).toMatchObject({ total: 0, get: 0, rate: 0 });
    expect(gachaCollection({ get: 1, wish: 1 }, 2.7)).toMatchObject({
      total: 2,
      missing: 0,
      rate: 50,
    });
  });
});
