import type { ItemType } from "./types";

/**
 * React Query 키. 훅과 invalidate 가 같은 키를 쓰도록 한 곳에 둔다.
 * 규칙: ["도메인", "용도", ...인자]. 도메인 전체를 비우려면 `queryKeys.gacha.all` 로 invalidate 한다.
 * 인자는 기본값을 채운 뒤 넘긴다 (생략한 값이 undefined 로 들어가면 같은 데이터가 다른 키로 두 번 캐시된다).
 * 로컬 기록은 쓰기 후 `items.all` · `folders.all` 로 통째로 비운다 (홈 소장률 · 상세 목록 · 내 굿즈가 모두 items 아래).
 */
export const queryKeys = {
  gacha: {
    all: ["gacha"] as const,
    list: (limit: number) => ["gacha", "list", limit] as const,
    popular: (limit: number) => ["gacha", "popular", limit] as const,
    detail: (id: string) => ["gacha", "detail", id] as const,
    search: (keyword: string, offset: number, limit: number) =>
      ["gacha", "search", keyword, offset, limit] as const,
  },
  items: {
    all: ["items"] as const,
    // 거르지 않는 조건은 null
    list: (gachaId: string | null, type: ItemType | null, folderId: string | null) =>
      ["items", "list", gachaId, type, folderId] as const,
    detail: (id: string) => ["items", "detail", id] as const,
    counts: (gachaId: string | null) => ["items", "counts", gachaId] as const,
    countsByFolder: () => ["items", "countsByFolder"] as const,
    nameTaken: (gachaId: string, name: string, excludeId: string | null) =>
      ["items", "nameTaken", gachaId, name, excludeId] as const,
  },
  folders: {
    all: ["folders"] as const,
    list: () => ["folders", "list"] as const,
    nameTaken: (name: string, excludeId: string | null) =>
      ["folders", "nameTaken", name, excludeId] as const,
  },
} as const;
