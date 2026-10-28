/**
 * 최근 검색어 · 최근 본 가챠. 기기에만 남는 기록이라 Supabase 가 아니라 키-값 저장소(앱은 AsyncStorage)에 둔다.
 * 이 파일은 인터페이스와 순수 함수(개수 · 중복 처리 · 검색어 다듬기)만 갖는다. 저장소에 읽고 쓰는 구현은 recent.storage.ts.
 */

/** 최근 검색어 · 최근 본 가챠 각각 최대 개수 */
export const RECENT_LIMIT = 10;

/**
 * 맨 앞에 넣는다. 이미 있으면 원래 자리에서 빼고 맨 앞으로 옮기고, limit 개를 넘으면 오래된 것(뒤)부터 버린다.
 * key 가 같으면 같은 항목으로 보고, 새로 넣은 value 의 모양을 남긴다. 받은 배열은 바꾸지 않는다.
 */
export function pushRecent(
  list: readonly string[],
  value: string,
  limit: number = RECENT_LIMIT,
  key: (v: string) => string = (v) => v
): string[] {
  const k = key(value);
  return [value, ...list.filter((v) => key(v) !== k)].slice(0, limit);
}

/** value 와 같은 항목을 뺀다. 없으면 같은 내용의 새 배열. */
export function removeRecent(list: readonly string[], value: string): string[] {
  return list.filter((v) => v !== value);
}

/**
 * 저장된 문자열을 목록으로 읽는다. 값이 없거나 깨졌으면(JSON 아님 · 배열 아님) 빈 목록.
 * 문자열이 아니거나 빈 항목은 버리고, 중복은 앞의 것만 남기고, limit 개까지만 돌려준다 (다른 버전이 쓴 값에 대비).
 */
export function parseRecent(raw: string | null, limit: number = RECENT_LIMIT): string[] {
  if (raw == null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  for (const v of parsed) {
    if (typeof v === "string" && v !== "" && !seen.has(v)) seen.add(v);
  }
  return [...seen].slice(0, limit);
}

/** 검색어를 기록용으로 다듬는다. 앞뒤 공백을 지우고 안쪽 연속 공백은 한 칸으로. 빈 문자열이면 기록하지 않는다. */
export function normalizeKeyword(keyword: string): string {
  return keyword.trim().replace(/\s+/g, " ");
}

/** 같은 검색어인지 볼 때 쓰는 값. 검색처럼 대소문자 · 전각/반각 차이는 같은 검색어로 본다. */
export function keywordKey(keyword: string): string {
  return keyword.normalize("NFKC").toLowerCase();
}

/** 칩처럼 좁은 자리에 보일 검색어. max 글자(이모지 등 두 칸짜리도 한 글자)를 넘으면 잘라서 "…" 를 붙인다. */
export function truncateKeyword(keyword: string, max: number): string {
  const chars = Array.from(keyword);
  return chars.length > max ? `${chars.slice(0, max).join("")}…` : keyword;
}

/**
 * 최근 기록 저장소. 쓰기 함수는 바뀐 뒤의 목록을 돌려준다 (훅이 다시 읽지 않고 캐시를 바로 바꾼다).
 * 목록은 모두 최신이 앞이다.
 */
export interface RecentRepository {
  listSearches(): Promise<string[]>;
  /** 공백만 있는 검색어는 무시하고 지금 목록을 그대로 돌려준다 */
  addSearch(keyword: string): Promise<string[]>;
  removeSearch(keyword: string): Promise<string[]>;
  clearSearches(): Promise<string[]>;

  listGachaIds(): Promise<string[]>;
  /** 가챠 상세에 들어갈 때 부른다 */
  addGachaId(id: string): Promise<string[]>;
  clearGachaIds(): Promise<string[]>;
}
