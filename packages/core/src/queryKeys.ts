/**
 * React Query 키. 훅과 invalidate 가 같은 키를 쓰도록 한 곳에 둔다.
 * 규칙: ["도메인", "용도", ...인자]. 도메인 전체를 비우려면 `queryKeys.gacha.all` 로 invalidate 한다.
 */
export const queryKeys = {
  gacha: {
    all: ["gacha"] as const,
    list: (limit?: number) => ["gacha", "list", limit] as const,
    popular: (limit?: number) => ["gacha", "popular", limit] as const,
    detail: (id: string) => ["gacha", "detail", id] as const,
    search: (keyword: string, offset = 0) => ["gacha", "search", keyword, offset] as const,
  },
} as const;
