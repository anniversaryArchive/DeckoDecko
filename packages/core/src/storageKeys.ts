/**
 * 기기 키-값 저장소(AsyncStorage · expo-sqlite kv-store) 키. 앱 전체의 키를 여기 한 곳에만 둔다 (흩어지면 키가 겹치거나 지울 때 빠뜨린다).
 * 새 키는 여기 추가하고, 저장소 구현이 이 객체에서 꺼내 쓴다. 화면 · 훅에서 키 문자열을 직접 적지 않는다.
 * 앞에 앱 이름을 붙여 다른 라이브러리의 키와 섞이지 않게 한다. 이름을 바꾸면 기존 기기의 값은 읽히지 않는다.
 */
export const storageKeys = {
  /** 최근 검색어 (JSON 문자열 배열, 최신이 앞) */
  recentSearches: "@deckodecko/recent-searches",
  /** 최근 본 가챠 id (JSON 문자열 배열, 최신이 앞) */
  recentGachaIds: "@deckodecko/recent-gacha-ids",
  /** 내 굿즈 보기 방식 ("items" | "gachas") */
  goodsViewMode: "@deckodecko/goods-view-mode",
  /** 설정에서 고른 언어 ("ko" | "en"). 첫 화면 전에 읽어야 해서 동기로 읽을 수 있는 expo-sqlite kv-store 에 둔다 */
  language: "@deckodecko/language",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
