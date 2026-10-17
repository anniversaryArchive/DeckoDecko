/**
 * React Query 키. 훅과 invalidate 가 같은 키를 쓰도록 한 곳에 둔다.
 * 규칙: ["도메인", "용도", ...인자]. 도메인 전체를 비우려면 `queryKeys.gacha.all` 로 invalidate 한다.
 * 인자는 기본값을 채운 뒤 넘긴다 (생략한 값이 undefined 로 들어가면 같은 데이터가 다른 키로 두 번 캐시된다).
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
} as const;
