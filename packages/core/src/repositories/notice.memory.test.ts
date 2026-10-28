import { describe, expect, it } from "vitest";

import type { Notice } from "../types";
import { createMemoryNoticeRepository } from "./notice.memory";

// 목 공지가 바뀌어도 깨지지 않도록 테스트마다 작은 seed 를 직접 만든다.
function notice(id: string, createdAt: string, isFixed = false): Notice {
  return { id, title: `title ${id}`, content: `content ${id}`, isFixed, createdAt };
}

const ids = (list: Notice[]) => list.map((n) => n.id);

describe("createMemoryNoticeRepository", () => {
  describe("listNotices", () => {
    it("고정 공지가 더 오래됐어도 먼저, 나머지는 최신순", async () => {
      const repo = createMemoryNoticeRepository([
        notice("old", "2026-10-01T00:00:00Z"),
        notice("fixed-old", "2026-09-01T00:00:00Z", true),
        notice("new", "2026-10-20T00:00:00Z"),
        notice("fixed-new", "2026-10-05T00:00:00Z", true),
        notice("mid", "2026-10-10T00:00:00Z"),
      ]);
      expect(ids(await repo.listNotices())).toEqual([
        "fixed-new",
        "fixed-old",
        "new",
        "mid",
        "old",
      ]);
    });

    it("limit: 고정 우선 · 최신순 정렬의 앞에서부터 자른다", async () => {
      const repo = createMemoryNoticeRepository([
        notice("a", "2026-10-20T00:00:00Z"),
        notice("b", "2026-10-21T00:00:00Z"),
        notice("fixed", "2026-01-01T00:00:00Z", true),
      ]);
      expect(ids(await repo.listNotices({ limit: 2 }))).toEqual(["fixed", "b"]);
    });

    it("fixedOnly: 고정 공지만 최신순, limit 까지", async () => {
      const repo = createMemoryNoticeRepository([
        notice("new", "2026-10-20T00:00:00Z"),
        notice("fixed-old", "2026-09-01T00:00:00Z", true),
        notice("fixed-new", "2026-10-05T00:00:00Z", true),
        notice("fixed-mid", "2026-09-20T00:00:00Z", true),
      ]);
      expect(ids(await repo.listNotices({ fixedOnly: true }))).toEqual([
        "fixed-new",
        "fixed-mid",
        "fixed-old",
      ]);
      expect(ids(await repo.listNotices({ fixedOnly: true, limit: 2 }))).toEqual([
        "fixed-new",
        "fixed-mid",
      ]);
    });

    it("fixedOnly: 고정 공지가 없으면 빈 배열", async () => {
      const repo = createMemoryNoticeRepository([notice("a", "2026-10-20T00:00:00Z")]);
      expect(await repo.listNotices({ fixedOnly: true })).toEqual([]);
    });

    it("작성 시각이 같으면 받은 순서를 지킨다", async () => {
      const at = "2026-10-20T00:00:00Z";
      const repo = createMemoryNoticeRepository([
        notice("x", at),
        notice("y", at),
        notice("z", at),
      ]);
      expect(ids(await repo.listNotices())).toEqual(["x", "y", "z"]);
    });

    it("limit 기본 20, 양의 정수가 아니면 기본값", async () => {
      const many = Array.from({ length: 25 }, (_, i) =>
        notice(`n${i}`, new Date(Date.UTC(2026, 0, i + 1)).toISOString())
      );
      const repo = createMemoryNoticeRepository(many);
      expect(await repo.listNotices()).toHaveLength(20);
      expect(await repo.listNotices({ limit: 3 })).toHaveLength(3);
      for (const bad of [0, -1, 1.5, Number.NaN]) {
        expect(await repo.listNotices({ limit: bad })).toHaveLength(20);
      }
    });

    it("빈 seed 면 빈 배열", async () => {
      expect(await createMemoryNoticeRepository([]).listNotices()).toEqual([]);
    });

    it("돌려준 객체를 고쳐도 저장소에는 영향이 없다", async () => {
      const repo = createMemoryNoticeRepository([notice("a", "2026-10-20T00:00:00Z")]);
      const [first] = await repo.listNotices();
      first!.title = "changed";
      expect((await repo.getNotice("a"))?.title).toBe("title a");
    });
  });

  describe("getNotice", () => {
    it("id 로 찾고, 없으면 null", async () => {
      const repo = createMemoryNoticeRepository([notice("a", "2026-10-20T00:00:00Z")]);
      expect((await repo.getNotice("a"))?.id).toBe("a");
      expect(await repo.getNotice("missing")).toBeNull();
    });
  });
});
