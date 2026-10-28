import { describe, expect, it } from "vitest";

import { storageKeys } from "../storageKeys";
import {
  createMemoryKeyValueStorage,
  createStorageRecentRepository,
  type KeyValueStorage,
} from "./recent.storage";

function setup(initial: Record<string, string> = {}) {
  const storage = createMemoryKeyValueStorage(initial);
  return { storage, repo: createStorageRecentRepository(storage) };
}

describe("createStorageRecentRepository", () => {
  describe("최근 검색어", () => {
    it("처음에는 비어 있다", async () => {
      const { repo } = setup();
      expect(await repo.listSearches()).toEqual([]);
    });

    it("추가하면 최신이 앞에 오고, 바뀐 목록을 돌려준다", async () => {
      const { repo } = setup();
      await repo.addSearch("고양이");
      expect(await repo.addSearch("루나")).toEqual(["루나", "고양이"]);
      expect(await repo.listSearches()).toEqual(["루나", "고양이"]);
    });

    it("중복이면 맨 앞으로 옮긴다", async () => {
      const { repo } = setup();
      for (const k of ["a", "b", "c"]) await repo.addSearch(k);
      expect(await repo.addSearch("a")).toEqual(["a", "c", "b"]);
    });

    it("최대 10개", async () => {
      const { repo } = setup();
      for (let i = 1; i <= 12; i++) await repo.addSearch(`k${i}`);
      const list = await repo.listSearches();
      expect(list).toHaveLength(10);
      expect(list[0]).toBe("k12");
      expect(list).not.toContain("k1");
      expect(list).not.toContain("k2");
    });

    it("앞뒤 공백을 다듬어 저장하고, 다듬은 값끼리 중복을 본다", async () => {
      const { repo } = setup();
      await repo.addSearch("  숲속  친구들 ");
      expect(await repo.addSearch("숲속 친구들")).toEqual(["숲속 친구들"]);
    });

    it("대소문자만 다른 검색어는 하나로 묶고, 마지막에 입력한 모양을 맨 앞에 남긴다", async () => {
      const { repo } = setup();
      await repo.addSearch("LUNA");
      await repo.addSearch("고양이");
      expect(await repo.addSearch("luna")).toEqual(["luna", "고양이"]);
    });

    it("공백뿐인 검색어는 기록하지 않고 저장소에 쓰지도 않는다", async () => {
      const { repo, storage } = setup();
      await repo.addSearch("a");
      const before = storage.snapshot();
      expect(await repo.addSearch("   ")).toEqual(["a"]);
      expect(storage.snapshot()).toEqual(before);
    });

    it("개별 삭제", async () => {
      const { repo } = setup();
      for (const k of ["a", "b", "c"]) await repo.addSearch(k);
      expect(await repo.removeSearch("b")).toEqual(["c", "a"]);
      expect(await repo.listSearches()).toEqual(["c", "a"]);
    });

    it("전체 삭제는 키를 지운다", async () => {
      const { repo, storage } = setup();
      await repo.addSearch("a");
      expect(await repo.clearSearches()).toEqual([]);
      expect(await repo.listSearches()).toEqual([]);
      expect(storage.snapshot()).not.toHaveProperty(storageKeys.recentSearches);
    });

    it("최근 본 가챠는 건드리지 않는다", async () => {
      const { repo } = setup();
      await repo.addGachaId("g1");
      await repo.addSearch("a");
      await repo.clearSearches();
      expect(await repo.listGachaIds()).toEqual(["g1"]);
    });
  });

  describe("최근 본 가챠", () => {
    it("추가 · 중복은 맨 앞으로 · 최대 10개", async () => {
      const { repo } = setup();
      for (let i = 1; i <= 11; i++) await repo.addGachaId(`g${i}`);
      expect(await repo.addGachaId("g5")).toEqual([
        "g5",
        "g11",
        "g10",
        "g9",
        "g8",
        "g7",
        "g6",
        "g4",
        "g3",
        "g2",
      ]);
    });

    it("빈 id 는 기록하지 않는다", async () => {
      const { repo } = setup();
      expect(await repo.addGachaId("")).toEqual([]);
    });

    it("전체 삭제", async () => {
      const { repo } = setup();
      await repo.addGachaId("g1");
      expect(await repo.clearGachaIds()).toEqual([]);
      expect(await repo.listGachaIds()).toEqual([]);
    });

    it("최근 검색어는 건드리지 않는다", async () => {
      const { repo } = setup();
      await repo.addSearch("a");
      await repo.addGachaId("g1");
      await repo.clearGachaIds();
      expect(await repo.listSearches()).toEqual(["a"]);
    });
  });

  describe("저장 형식 · 영속", () => {
    it("storageKeys 의 키에 JSON 배열로 저장한다", async () => {
      const { repo, storage } = setup();
      await repo.addSearch("a");
      await repo.addGachaId("g1");
      expect(storage.snapshot()).toEqual({
        [storageKeys.recentSearches]: JSON.stringify(["a"]),
        [storageKeys.recentGachaIds]: JSON.stringify(["g1"]),
      });
    });

    it("같은 저장소로 새로 만들어도(앱 재시작) 목록이 남아 있다", async () => {
      const storage = createMemoryKeyValueStorage();
      const first = createStorageRecentRepository(storage);
      await first.addSearch("a");
      await first.addGachaId("g1");

      const second = createStorageRecentRepository(storage);
      expect(await second.listSearches()).toEqual(["a"]);
      expect(await second.listGachaIds()).toEqual(["g1"]);
    });

    it("깨진 값이 저장돼 있으면 빈 목록으로 보고, 다음 쓰기에서 덮어쓴다", async () => {
      const { repo, storage } = setup({ [storageKeys.recentSearches]: "{broken" });
      expect(await repo.listSearches()).toEqual([]);
      await repo.addSearch("a");
      expect(storage.snapshot()[storageKeys.recentSearches]).toBe(JSON.stringify(["a"]));
    });
  });

  describe("경계 · 실패", () => {
    it("없는 검색어를 지워도 목록은 그대로", async () => {
      const { repo } = setup();
      await repo.addSearch("a");
      expect(await repo.removeSearch("zzz")).toEqual(["a"]);
    });

    it("비어 있을 때 전체 삭제해도 빈 목록", async () => {
      const { repo } = setup();
      expect(await repo.clearSearches()).toEqual([]);
      expect(await repo.clearGachaIds()).toEqual([]);
    });

    it("저장소를 못 읽으면 목록 함수가 실패를 그대로 알리고, 다음 읽기는 다시 시도한다", async () => {
      const inner = createMemoryKeyValueStorage();
      let failNext = true;
      const flaky: KeyValueStorage = {
        async getItem(k) {
          if (failNext) {
            failNext = false;
            throw new Error("read failed");
          }
          return inner.getItem(k);
        },
        setItem: (k, v) => inner.setItem(k, v),
        removeItem: (k) => inner.removeItem(k),
      };
      const repo = createStorageRecentRepository(flaky);
      await expect(repo.listSearches()).rejects.toThrow("read failed");
      expect(await repo.listSearches()).toEqual([]);
    });
  });

  describe("동시 쓰기", () => {
    /** 읽기 · 쓰기마다 잠깐 기다리는 저장소 (AsyncStorage 처럼 실제로 비동기) */
    function slowStorage(): KeyValueStorage & { snapshot(): Record<string, string> } {
      const inner = createMemoryKeyValueStorage();
      const tick = () => new Promise((r) => setTimeout(r, 1));
      return {
        getItem: async (k) => (await tick(), inner.getItem(k)),
        setItem: async (k, v) => (await tick(), inner.setItem(k, v)),
        removeItem: async (k) => (await tick(), inner.removeItem(k)),
        snapshot: inner.snapshot,
      };
    }

    it("기다리지 않고 연달아 추가해도 하나도 잃지 않는다", async () => {
      const repo = createStorageRecentRepository(slowStorage());
      await Promise.all(["a", "b", "c", "d"].map((k) => repo.addSearch(k)));
      expect(await repo.listSearches()).toEqual(["d", "c", "b", "a"]);
    });

    it("추가 직후 삭제를 기다리지 않고 불러도 순서대로 반영된다", async () => {
      const repo = createStorageRecentRepository(slowStorage());
      void repo.addGachaId("g1");
      void repo.clearGachaIds();
      const last = repo.addGachaId("g2");
      expect(await last).toEqual(["g2"]);
    });

    it("앞의 쓰기가 실패해도 뒤의 쓰기는 진행한다", async () => {
      const inner = createMemoryKeyValueStorage();
      let failNext = true;
      const flaky: KeyValueStorage = {
        getItem: (k) => inner.getItem(k),
        removeItem: (k) => inner.removeItem(k),
        async setItem(k, v) {
          if (failNext) {
            failNext = false;
            throw new Error("disk full");
          }
          await inner.setItem(k, v);
        },
      };
      const repo = createStorageRecentRepository(flaky);
      const failed = repo.addSearch("a");
      const ok = repo.addSearch("b");
      await expect(failed).rejects.toThrow("disk full");
      expect(await ok).toEqual(["b"]);
    });
  });
});
