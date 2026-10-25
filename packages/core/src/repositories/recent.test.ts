import { describe, expect, it } from "vitest";

import {
  normalizeKeyword,
  parseRecent,
  pushRecent,
  RECENT_LIMIT,
  removeRecent,
  truncateKeyword,
} from "./recent";

const range = (n: number, prefix = "k") => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);

describe("pushRecent", () => {
  it("맨 앞에 넣는다", () => {
    expect(pushRecent(["b", "c"], "a")).toEqual(["a", "b", "c"]);
  });

  it("빈 목록에도 넣는다", () => {
    expect(pushRecent([], "a")).toEqual(["a"]);
  });

  it("이미 있으면 원래 자리에서 빼고 맨 앞으로 옮긴다 (개수는 그대로)", () => {
    expect(pushRecent(["a", "b", "c"], "c")).toEqual(["c", "a", "b"]);
    expect(pushRecent(["a", "b", "c"], "a")).toEqual(["a", "b", "c"]);
  });

  it("기본 최대 10개. 넘으면 가장 오래된 것(맨 뒤)을 버린다", () => {
    expect(RECENT_LIMIT).toBe(10);
    const full = range(10);
    const next = pushRecent(full, "new");
    expect(next).toHaveLength(10);
    expect(next[0]).toBe("new");
    expect(next).not.toContain("k10");
    expect(next[9]).toBe("k9");
  });

  it("꽉 찬 목록에서 이미 있는 값을 다시 넣으면 아무것도 버리지 않는다", () => {
    const full = range(10);
    const next = pushRecent(full, "k10");
    expect(next).toHaveLength(10);
    expect(next[0]).toBe("k10");
    expect([...next].sort()).toEqual([...full].sort());
  });

  it("limit 을 넘기면 그 개수까지만", () => {
    expect(pushRecent(["a", "b", "c"], "d", 2)).toEqual(["d", "a"]);
  });

  it("받은 배열을 바꾸지 않는다", () => {
    const list = ["a", "b"];
    pushRecent(list, "b");
    expect(list).toEqual(["a", "b"]);
  });

  it("대소문자가 다르면 다른 값으로 본다", () => {
    expect(pushRecent(["Luna"], "luna")).toEqual(["luna", "Luna"]);
  });
});

describe("removeRecent", () => {
  it("같은 값을 뺀다", () => {
    expect(removeRecent(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("없으면 그대로", () => {
    expect(removeRecent(["a"], "z")).toEqual(["a"]);
  });

  it("받은 배열을 바꾸지 않는다", () => {
    const list = ["a", "b"];
    removeRecent(list, "a");
    expect(list).toEqual(["a", "b"]);
  });
});

describe("parseRecent", () => {
  it("저장된 JSON 배열을 그대로 읽는다", () => {
    expect(parseRecent(JSON.stringify(["a", "b"]))).toEqual(["a", "b"]);
  });

  it("값이 없으면(null) 빈 목록", () => {
    expect(parseRecent(null)).toEqual([]);
  });

  it("JSON 이 아니거나 배열이 아니면 빈 목록", () => {
    for (const raw of ["", "not json", "{", "{}", '"a"', "1", "null"]) {
      expect(parseRecent(raw), raw).toEqual([]);
    }
  });

  it("문자열이 아니거나 빈 항목은 버린다", () => {
    expect(parseRecent(JSON.stringify(["a", 1, null, "", { x: 1 }, "b"]))).toEqual(["a", "b"]);
  });

  it("중복은 앞의 것만 남긴다", () => {
    expect(parseRecent(JSON.stringify(["a", "b", "a", "c", "b"]))).toEqual(["a", "b", "c"]);
  });

  it("최대 개수를 넘으면 앞에서부터 그 개수까지만", () => {
    expect(parseRecent(JSON.stringify(range(15)))).toEqual(range(10));
    expect(parseRecent(JSON.stringify(range(5)), 3)).toEqual(range(3));
  });
});

describe("normalizeKeyword", () => {
  it("앞뒤 공백을 지우고 안쪽 연속 공백은 한 칸으로", () => {
    expect(normalizeKeyword("  숲속   친구들 ")).toBe("숲속 친구들");
    expect(normalizeKeyword("\t루나\n")).toBe("루나");
  });

  it("공백뿐이면 빈 문자열 (전각 공백 포함)", () => {
    for (const keyword of ["", "   ", "\t\n", "　"]) {
      expect(normalizeKeyword(keyword), JSON.stringify(keyword)).toBe("");
    }
  });
});

describe("truncateKeyword", () => {
  it("max 글자 이하면 그대로", () => {
    expect(truncateKeyword("루나", 12)).toBe("루나");
    expect(truncateKeyword("123456789012", 12)).toBe("123456789012");
  });

  it("넘으면 max 글자까지 남기고 줄임표", () => {
    expect(truncateKeyword("숲속 친구들 마스코트 컬렉션", 12)).toBe("숲속 친구들 마스코트 …");
  });

  it("이모지 · 서로게이트 쌍을 반으로 자르지 않는다", () => {
    expect(truncateKeyword("🐱🐶🐰", 2)).toBe("🐱🐶…");
  });

  it("빈 문자열은 빈 문자열", () => {
    expect(truncateKeyword("", 12)).toBe("");
  });
});
