import { normalizeSearch } from "../name";
import { count } from "../pagination";
import type { Media } from "../types";

/** 자동완성 결과 개수의 기본값. 검색 함수와 훅이 같은 값을 쓰도록 여기 둔다. */
export const MEDIA_DEFAULTS = {
  searchLimit: 10,
} as const;

export type SearchMediaParams = {
  keyword: string; // 작품 이름(한 · 일 · 영) · 별칭을 함께 검색한다
  limit?: number; // 기본 10. 양의 정수가 아니면 기본값
};

/** 검색 대상 작품 한 건. 별칭은 검색에만 쓰고 검색 결과(Media)에는 싣지 않는다. */
export type MediaEntry = Media & { aliases?: readonly string[] };

/**
 * 작품(media) 읽기. 요청 · 문의의 작품 칸 자동완성에서 쓴다.
 *   createMemoryMediaRepository (목 데이터) / createSupabaseMediaRepository (anime 테이블)
 * 별칭(text[]) 부분 일치를 서버에서 거를 수 없어 전체를 받고, 검색은 searchMedia 로 기기에서 한다 (useMediaSearch).
 */
export interface MediaRepository {
  /** 작품 전체 (별칭 포함). 순서는 구현이 정하고, 검색에서 같은 순위끼리는 이 순서를 따른다 */
  listMedia(): Promise<MediaEntry[]>;
}

type IndexedMedia = { media: Media; names: string[] };

// React Query 가 같은 목록을 같은 참조로 돌려주므로, 목록마다 이름 정규화를 한 번만 한다
const indexCache = new WeakMap<readonly MediaEntry[], IndexedMedia[]>();

function indexOf(entries: readonly MediaEntry[]): IndexedMedia[] {
  let indexed = indexCache.get(entries);
  if (!indexed) {
    indexed = entries.map(({ aliases = [], ...media }) => ({
      media,
      names: [media.title, media.titleJa, media.titleEn, ...aliases]
        .filter((v): v is string => typeof v === "string")
        .map(normalizeSearch),
    }));
    indexCache.set(entries, indexed);
  }
  return indexed;
}

/**
 * 이름 · 별칭 부분 일치. 이름이나 별칭이 검색어로 시작하는 작품이 앞에 온다. 빈 검색어는 빈 배열.
 * 공백 · 대소문자 · 전각을 무시한다 (normalizeSearch). 결과는 복사본이라 고쳐도 목록은 그대로다.
 */
export function searchMedia(
  entries: readonly MediaEntry[],
  { keyword, limit }: SearchMediaParams
): Media[] {
  const q = normalizeSearch(keyword);
  if (!q) return [];
  const size = count(limit, MEDIA_DEFAULTS.searchLimit);
  const prefix: Media[] = [];
  const partial: Media[] = [];
  for (const { media, names } of indexOf(entries)) {
    if (names.some((n) => n.startsWith(q))) prefix.push(media);
    else if (names.some((n) => n.includes(q))) partial.push(media);
    if (prefix.length >= size) break;
  }
  return [...prefix, ...partial].slice(0, size).map((m) => ({ ...m }));
}
