import { describe, expect, it } from "vitest";

import { gachaCollection, gachaCollectionRates } from "./collection";

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
    // 나누기를 먼저 하면 57.99… → 57 이 된다
    expect(gachaCollection({ get: 29, wish: 0 }, 50).rate).toBe(58);
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

describe("gachaCollectionRates", () => {
  const lineups = (entries: Record<string, number | null>) =>
    new Map(Object.entries(entries).map(([id, itemCount]) => [id, { itemCount }]));

  it("ids 의 가챠마다 기록 수와 라인업으로 소장률을 만들고, 기록이 없는 가챠도 넣는다", () => {
    const rates = gachaCollectionRates(
      ["g1", "g2"],
      { g1: { wish: 1, get: 3 }, other: { wish: 0, get: 9 } },
      lineups({ g1: 6, g2: 5 })
    );
    expect(Object.keys(rates)).toEqual(["g1", "g2"]);
    expect(rates.g1).toEqual({
      counts: { wish: 1, get: 3 },
      collection: gachaCollection({ wish: 1, get: 3 }, 6),
    });
    expect(rates.g1!.collection!.rate).toBe(50);
    expect(rates.g2).toEqual({
      counts: { wish: 0, get: 0 },
      collection: gachaCollection({ wish: 0, get: 0 }, 5),
    });
  });

  it("GET 이 라인업보다 많으면 소장률은 100 에서 멈추고, counts 는 그대로 둔다", () => {
    const { g1 } = gachaCollectionRates(["g1"], { g1: { wish: 0, get: 7 } }, lineups({ g1: 6 }));
    expect(g1!.counts.get).toBe(7);
    expect(g1!.collection!.rate).toBe(100);
  });

  it("라인업 수를 모르거나(카탈로그에 없음 · null) 0 이면 collection 은 null", () => {
    const counts = { g1: { wish: 0, get: 1 }, g2: { wish: 0, get: 1 }, g3: { wish: 0, get: 1 } };
    const rates = gachaCollectionRates(["g1", "g2", "g3"], counts, lineups({ g2: null, g3: 0 }));
    expect(rates.g1!.collection).toBeNull();
    expect(rates.g2!.collection).toBeNull();
    expect(rates.g3!.collection).toBeNull();
    expect(rates.g1!.counts).toEqual({ wish: 0, get: 1 });
  });
});
