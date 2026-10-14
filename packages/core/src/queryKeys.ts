/**
 * React Query 키. 훅과 invalidate 가 같은 키를 쓰도록 한 곳에 둔다.
 * 규칙: ["도메인", "용도", ...인자]. 도메인 전체를 비우려면 `queryKeys.gacha.all` 로 invalidate 한다.
 * 선택 인자는 `?? null` 로 자리를 채워 키 길이를 고정한다 (React Query 가 undefined 를 null 로 직렬화하긴 하지만 그 규칙에 기대지 않는다).
 */
export const queryKeys = {
  gacha: {
    all: ["gacha"] as const,
    list: (limit?: number) => ["gacha", "list", limit ?? null] as const,
    popular: (limit?: number) => ["gacha", "popular", limit ?? null] as const,
    detail: (id: string) => ["gacha", "detail", id] as const,
    search: (keyword: string, offset = 0) => ["gacha", "search", keyword, offset] as const,
  },
} as const;
