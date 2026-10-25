import { storageKeys, type StorageKey } from "../storageKeys";
import { normalizeKeyword, parseRecent, pushRecent, removeRecent } from "./recent";
import type { RecentRepository } from "./recent";

/**
 * 문자열 키-값 저장소의 모양. 앱은 AsyncStorage 를 그대로 넘기고, 테스트는 createMemoryKeyValueStorage 를 넘긴다.
 * 이 패키지가 AsyncStorage 를 import 하지 않게 모양만 받는다 (백오피스 · 테스트에는 react-native 가 없다).
 */
export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

/** 메모리 안의 키-값 저장소. 테스트와 개발 화면용. 앱을 끄면 사라진다. */
export function createMemoryKeyValueStorage(
  initial: Record<string, string> = {}
): KeyValueStorage & { snapshot(): Record<string, string> } {
  const map = new Map(Object.entries(initial));
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
    snapshot() {
      return Object.fromEntries(map);
    },
  };
}

/**
 * 키-값 저장소 위의 최근 기록 저장소. 키는 storageKeys 에서만 꺼낸다.
 * 쓰기는 한 줄로 세워 차례로 한다. 읽고-고치고-쓰는 사이에 다른 쓰기가 끼면 앞의 변경이 사라지기 때문이다
 * (상세를 빠르게 연달아 열거나 검색 직후 삭제를 누를 때).
 */
export function createStorageRecentRepository(storage: KeyValueStorage): RecentRepository {
  let queue: Promise<unknown> = Promise.resolve();

  /** 앞의 쓰기가 끝난 뒤에 실행한다. 앞의 쓰기가 실패해도 뒤의 쓰기는 진행한다. */
  function serial<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  async function read(key: StorageKey): Promise<string[]> {
    return parseRecent(await storage.getItem(key));
  }

  function update(key: StorageKey, change: (list: string[]) => string[]): Promise<string[]> {
    return serial(async () => {
      const before = await read(key);
      const after = change(before);
      await storage.setItem(key, JSON.stringify(after));
      return after;
    });
  }

  function clear(key: StorageKey): Promise<string[]> {
    return serial(async () => {
      await storage.removeItem(key);
      return [];
    });
  }

  return {
    // 읽기도 줄에 세워, 쓰기 직후의 읽기가 쓰기 전 값을 보지 않게 한다
    listSearches: () => serial(() => read(storageKeys.recentSearches)),
    addSearch(keyword) {
      const value = normalizeKeyword(keyword);
      if (!value) return serial(() => read(storageKeys.recentSearches));
      return update(storageKeys.recentSearches, (list) => pushRecent(list, value));
    },
    removeSearch: (keyword) =>
      update(storageKeys.recentSearches, (list) => removeRecent(list, keyword)),
    clearSearches: () => clear(storageKeys.recentSearches),

    listGachaIds: () => serial(() => read(storageKeys.recentGachaIds)),
    addGachaId(id) {
      if (!id) return serial(() => read(storageKeys.recentGachaIds));
      return update(storageKeys.recentGachaIds, (list) => pushRecent(list, id));
    },
    clearGachaIds: () => clear(storageKeys.recentGachaIds),
  };
}
