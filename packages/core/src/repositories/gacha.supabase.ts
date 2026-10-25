import type { Tables } from "../database.types";
import type { DeckoSupabaseClient } from "../supabase";
import type { Gacha, GachaDetail, GachaItem, Media, MediaKind } from "../types";
import { GACHA_DEFAULTS } from "./gacha";
import type { GachaRepository, ListGachaParams, SearchGachaParams } from "./gacha";

// ─────────────────────────────────────────────
// 행 → 도메인 매핑. DB 컬럼 이름(snake_case)은 이 파일 밖으로 나가지 않는다.
// ─────────────────────────────────────────────

/** 목록 · 검색 · 상세가 같이 쓰는 select. 작품은 FK(gacha.anime_id) 로 붙인다. */
const ANIME_COLUMNS = "id, kr_title, jp_title, en_title, type" as const;
const GACHA_COLUMNS =
  `id, name, name_kr, image_link, price, release_month, anime(${ANIME_COLUMNS})` as const;
const SUMMARY_SELECT = `${GACHA_COLUMNS}, gacha_items(count)` as const;
const DETAIL_SELECT =
  `${GACHA_COLUMNS}, gacha_items(id, gacha_id, name, name_kr, image_link, sort_order)` as const;

export type AnimeRow = Pick<Tables<"anime">, "id" | "kr_title" | "jp_title" | "en_title" | "type">;
type GachaBaseRow = Pick<
  Tables<"gacha">,
  "id" | "name" | "name_kr" | "image_link" | "price" | "release_month"
> & { anime: AnimeRow | null };
/** 목록 · 검색 행. 라인업은 개수만 받는다 (PostgREST 의 embedded count). */
export type GachaSummaryRow = GachaBaseRow & { gacha_items: { count: number }[] };
export type GachaItemRow = Pick<
  Tables<"gacha_items">,
  "id" | "gacha_id" | "name" | "name_kr" | "image_link" | "sort_order"
>;
/** 상세 행. 라인업을 다 받는다. */
export type GachaDetailRow = GachaBaseRow & { gacha_items: GachaItemRow[] };

const MEDIA_KINDS: readonly string[] = ["anime", "game", "character"] satisfies MediaKind[];

function toMediaKind(type: string | null): MediaKind | null {
  return type !== null && MEDIA_KINDS.includes(type) ? (type as MediaKind) : null;
}

/** DB 의 발매 월은 그 달 1일(date, "YYYY-MM-01"). 앱은 "YYYY-MM" 으로 쓴다. 형식이 다르면 null. */
export function toReleaseMonth(value: string | null): string | null {
  const match = value?.match(/^(\d{4}-\d{2})-\d{2}/);
  return match?.[1] ?? null;
}

export function toMedia(row: AnimeRow): Media {
  return {
    id: String(row.id),
    title: row.kr_title,
    titleJa: row.jp_title,
    titleEn: row.en_title,
    kind: toMediaKind(row.type),
    imageUrl: null, // anime 테이블에 이미지 컬럼이 아직 없다
  };
}

function toGachaBase(row: GachaBaseRow, itemCount: number): Gacha {
  return {
    id: String(row.id),
    // 레거시 데이터는 원문 이름이 빈 행이 있다. 한국어 이름으로 채우고 둘 다 없으면 빈 문자열.
    name: row.name ?? row.name_kr ?? "",
    nameKo: row.name_kr,
    imageUrl: row.image_link,
    media: row.anime ? toMedia(row.anime) : null,
    price: row.price,
    releaseMonth: toReleaseMonth(row.release_month),
    itemCount,
  };
}

export function toGacha(row: GachaSummaryRow): Gacha {
  return toGachaBase(row, row.gacha_items[0]?.count ?? 0);
}

/** 라인업은 sort_order → id 순으로 세운 뒤 1부터 번호를 매긴다 (sort_order 는 기본값 0 이라 겹칠 수 있다). */
export function toGachaDetail(row: GachaDetailRow): GachaDetail {
  const items: GachaItem[] = [...row.gacha_items]
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map((item, index) => ({
      id: String(item.id),
      gachaId: String(item.gacha_id),
      number: index + 1,
      name: item.name,
      nameKo: item.name_kr,
      imageUrl: item.image_link,
    }));
  return { ...toGachaBase(row, items.length), items };
}

// ─────────────────────────────────────────────
// 검색어 → PostgREST 필터
// ─────────────────────────────────────────────

/**
 * 검색어를 `col.ilike."%...%"` 의 값으로 만든다.
 * LIKE 와일드카드(% _)와 \ 는 글자 그대로 찾도록 이스케이프하고,
 * PostgREST 는 like · ilike 값의 * 를 % 로 바꾸고 이스케이프할 방법이 없어서, * 는 아무 한 글자(_)로 찾는다.
 * or() 문법을 깨는 , ( ) . : 가 들어 있어도 되게 큰따옴표로 감싼다 (안쪽의 " 와 \ 는 다시 이스케이프).
 */
export function toIlikeValue(keyword: string): string {
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&").replace(/\*/g, "_")}%`;
  return `"${pattern.replace(/["\\]/g, "\\$&")}"`;
}

function ilikeAny(columns: readonly string[], keyword: string): string {
  const value = toIlikeValue(keyword);
  return columns.map((column) => `${column}.ilike.${value}`).join(",");
}

/**
 * DB id 는 bigint. 숫자가 아닌 id 는 요청하지 않고 없는 것으로 본다.
 * "007" 처럼 앞에 0 이 붙은 id 도 없는 것으로 본다 (받으면 돌려주는 id "7" 과 캐시 키가 어긋난다).
 */
function toDbId(id: string): number | null {
  if (!/^(0|[1-9]\d*)$/.test(id)) return null;
  const n = Number(id);
  return Number.isSafeInteger(n) ? n : null;
}

/** min 이상의 정수가 아니면(음수 · 소수 · NaN 등) 기본값. 메모리 구현과 같은 규칙. */
function count(n: number | undefined, fallback: number, min = 1): number {
  return n !== undefined && Number.isInteger(n) && n >= min ? n : fallback;
}

/** offset 이 전체 개수를 넘으면 PostgREST 가 416(PGRST103)을 준다. 에러가 아니라 빈 페이지로 본다. */
const RANGE_NOT_SATISFIABLE = "PGRST103";

type PostgrestErrorLike = { message: string; code?: string };

/** 실패는 throw 해서 React Query 의 error 상태로 보낸다. 빈 결과(빈 배열 · null)와 섞이지 않게 한다. */
function fail(action: string, error: PostgrestErrorLike): never {
  throw new Error(`[gacha.${action}] ${error.message}`, { cause: error });
}

// ─────────────────────────────────────────────
// 저장소
// ─────────────────────────────────────────────

/**
 * Supabase(PostgREST) 로 읽는 가챠 저장소. 계약은 GachaRepository 와 같다.
 *   - 최신순: created_at → id 내림차순.
 *   - 인기: 임시. 집계 RPC(#137, get_top_gacha_views) 전까지 오래 등록된 순(id 오름차순)이라 실제 인기와 상관없다.
 *     조회 로그는 anon 이 읽을 수 없어 클라이언트에서 집계하지 않는다. RPC 가 오면 이 함수의 호출만 바꾼다.
 *   - 검색: RPC(#136) 전까지 ilike. 가챠 이름(원문 · 한국어) 또는 작품명(한 · 일 · 영)에 부분 일치, 대소문자 무시.
 *     작품명은 PostgREST 가 부모 · 자식 컬럼을 한 or() 로 못 묶어서, 맞는 작품 id 를 먼저 받아 anime_id.in 으로 넣는다.
 */
export function createSupabaseGachaRepository(client: DeckoSupabaseClient): GachaRepository {
  const gachaTable = () => client.from("gacha");

  async function matchingAnimeIds(keyword: string): Promise<number[]> {
    const { data, error } = await client
      .from("anime")
      .select("id")
      .or(ilikeAny(["kr_title", "jp_title", "en_title"], keyword));
    if (error) fail("searchGacha", error);
    return data.map((row) => row.id);
  }

  return {
    async listGacha(params?: ListGachaParams) {
      const limit = count(params?.limit, GACHA_DEFAULTS.listLimit);
      const { data, error } = await gachaTable()
        .select(SUMMARY_SELECT)
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false })
        .limit(limit);
      if (error) fail("listGacha", error);
      return data.map(toGacha);
    },

    async listPopularGacha(limit?: number) {
      const { data, error } = await gachaTable()
        .select(SUMMARY_SELECT)
        .order("id", { ascending: true })
        .limit(count(limit, GACHA_DEFAULTS.popularLimit));
      if (error) fail("listPopularGacha", error);
      return data.map(toGacha);
    },

    async getGacha(id: string) {
      const dbId = toDbId(id);
      if (dbId === null) return null;
      const { data, error } = await gachaTable().select(DETAIL_SELECT).eq("id", dbId).maybeSingle();
      if (error) fail("getGacha", error);
      return data ? toGachaDetail(data) : null;
    },

    async searchGacha(params: SearchGachaParams) {
      const limit = count(params.limit, GACHA_DEFAULTS.searchLimit);
      const offset = count(params.offset, GACHA_DEFAULTS.searchOffset, 0);
      const keyword = params.keyword.normalize("NFKC").trim();
      if (!keyword) return { items: [], total: 0 };

      const animeIds = await matchingAnimeIds(keyword);
      const filter = [
        ilikeAny(["name", "name_kr"], keyword),
        ...(animeIds.length > 0 ? [`anime_id.in.(${animeIds.join(",")})`] : []),
      ].join(",");

      // 결과와 전체 개수를 한 요청으로 받는다 (count 는 range 와 상관없이 전체 개수)
      const {
        data,
        error,
        count: total,
      } = await gachaTable()
        .select(SUMMARY_SELECT, { count: "exact" })
        .or(filter)
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        if (error.code !== RANGE_NOT_SATISFIABLE) fail("searchGacha", error);
        // 마지막 페이지 너머: 개수만 따로 센다
        const head = await gachaTable().select("id", { count: "exact", head: true }).or(filter);
        if (head.error) fail("searchGacha", head.error);
        return { items: [], total: head.count ?? 0 };
      }
      return { items: data.map(toGacha), total: total ?? data.length };
    },
  };
}
