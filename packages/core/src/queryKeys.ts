import type { GachaSort, ResolvedGachaFilter } from "./repositories/gacha";
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
    byIds: (ids: readonly string[]) => ["gacha", "byIds", ids] as const,
    detail: (id: string) => ["gacha", "detail", id] as const,
    /** 검색 결과 무한 스크롤. 필터는 resolveGachaFilter 를 거친 값, month 는 신상품 · 발매 예정의 기준 달(toYearMonth) */
    searchPages: (
      keyword: string,
      filter: ResolvedGachaFilter,
      sort: GachaSort,
      pageSize: number,
      month: string
    ) => ["gacha", "searchPages", keyword, filter, sort, pageSize, month] as const,
  },
  notice: {
    all: ["notice"] as const,
    list: (limit: number) => ["notice", "list", limit] as const,
    home: (limit: number) => ["notice", "home", limit] as const,
    detail: (id: string) => ["notice", "detail", id] as const,
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
    // mutation 키. 저장 중인 WISH · GET 을 mutation 캐시에서 찾을 때 쓴다 (useDisplayedItemType)
    setType: ["items", "setType"] as const,
  },
  folders: {
    all: ["folders"] as const,
    list: () => ["folders", "list"] as const,
    nameTaken: (name: string, excludeId: string | null) =>
      ["folders", "nameTaken", name, excludeId] as const,
  },
  // 기기의 최근 기록. 쓰기 훅이 바뀐 목록으로 캐시를 바로 바꾼다.
  recent: {
    all: ["recent"] as const,
    searches: () => ["recent", "searches"] as const,
    gachaIds: () => ["recent", "gachaIds"] as const,
  },
  // 기기 설정. 쓰기 훅이 캐시를 바로 바꾼다.
  preferences: {
    all: ["preferences"] as const,
    goodsViewMode: () => ["preferences", "goodsViewMode"] as const,
  },
} as const;
