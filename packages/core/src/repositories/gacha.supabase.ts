import { count } from "../pagination";
import type { DeckoSupabaseClient } from "../supabase";
import { GACHA_DEFAULTS, resolveGachaFilter, toYearMonth } from "./gacha";
import type {
  GachaRepository,
  GachaRepositoryOptions,
  ListGachaParams,
  SearchGachaParams,
} from "./gacha";
import { toGacha, toGachaDetail } from "./gacha.supabase.mappers";
import {
  ilikeAny,
  toDbId,
  toFilterConditions,
  toOrderBy,
  type FilterCondition,
} from "./gacha.supabase.params";
import { DETAIL_SELECT, SUMMARY_SELECT } from "./gacha.supabase.rows";

/** offset 이 전체 개수를 넘으면 PostgREST 가 416(PGRST103)을 준다. 에러가 아니라 빈 페이지로 본다. */
const RANGE_NOT_SATISFIABLE = "PGRST103";

type PostgrestErrorLike = { message: string; code?: string };

/** 쿼리에 필터 조건을 모두 붙인다 (AND). */
function withConditions<Q extends { filter(column: string, operator: string, value: unknown): Q }>(
  query: Q,
  conditions: readonly FilterCondition[]
): Q {
  return conditions.reduce((q, c) => q.filter(c.column, c.operator, c.value), query);
}

/** 실패는 throw 해서 React Query 의 error 상태로 보낸다. 빈 결과(빈 배열 · null)와 섞이지 않게 한다. */
function fail(action: string, error: PostgrestErrorLike): never {
  throw new Error(`[gacha.${action}] ${error.message}`, { cause: error });
}

/**
 * Supabase(PostgREST) 로 읽는 가챠 저장소. 계약은 GachaRepository 와 같다.
 *   - 최신순: created_at → id 내림차순.
 *   - 인기: 임시. 집계 RPC(#137, get_top_gacha_views) 전까지 오래 등록된 순(id 오름차순)이라 실제 인기와 상관없다.
 *     조회 로그는 anon 이 읽을 수 없어 클라이언트에서 집계하지 않는다. RPC 가 오면 이 함수의 호출만 바꾼다.
 *   - 검색: RPC(#136) 전까지 ilike. 가챠 이름(원문 · 한국어) 또는 작품명(한 · 일 · 영)에 부분 일치, 대소문자 무시.
 *     필터 · 정렬 규칙은 GachaFilter · GachaSort 와 메모리 구현과 같다 (변환은 gacha.supabase.params).
 * 행 타입 · select 는 gacha.supabase.rows, 행 → 도메인 매핑은 gacha.supabase.mappers, 요청 값 만들기는 gacha.supabase.params.
 */
export function createSupabaseGachaRepository(
  client: DeckoSupabaseClient,
  options: GachaRepositoryOptions = {}
): GachaRepository {
  const gachaTable = () => client.from("gacha");
  const now = options.now ?? (() => new Date());

  // PostgREST 는 가챠 · 작품 컬럼을 한 or() 로 못 묶어서, 맞는 작품 id 를 먼저 받아 anime_id.in 으로 넣는다.
  async function searchFilter(keyword: string): Promise<string> {
    const { data, error } = await client
      .from("anime")
      .select("id")
      .or(ilikeAny(["kr_title", "jp_title", "en_title"], keyword));
    if (error) fail("searchGacha", error);
    const animeIds = data.map((row) => row.id);
    return [
      ilikeAny(["name", "name_kr"], keyword),
      ...(animeIds.length > 0 ? [`anime_id.in.(${animeIds.join(",")})`] : []),
    ].join(",");
  }

  /** 조건에 맞는 전체 개수만 센다 (행은 받지 않는다). */
  async function countOnly(
    filter: string,
    conditions: readonly FilterCondition[]
  ): Promise<number> {
    const { count: total, error } = await withConditions(
      gachaTable().select("id", { count: "exact", head: true }).or(filter),
      conditions
    );
    if (error) fail("searchGacha.count", error);
    return total ?? 0;
  }

  return {
    async listGacha(params?: ListGachaParams) {
      const { data, error } = await gachaTable()
        .select(SUMMARY_SELECT)
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false })
        .limit(count(params?.limit, GACHA_DEFAULTS.listLimit));
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

    async listGachaByIds(ids: readonly string[]) {
      const dbIds = ids.map(toDbId).filter((n) => n !== null);
      if (dbIds.length === 0) return [];
      const { data, error } = await gachaTable().select(SUMMARY_SELECT).in("id", dbIds);
      if (error) fail("listGachaByIds", error);
      // in() 은 순서를 지키지 않아서 받은 id 순서로 다시 세운다
      const byId = new Map(data.map((row) => [String(row.id), toGacha(row)]));
      return ids.flatMap((id) => byId.get(id) ?? []);
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
      const conditions = toFilterConditions(resolveGachaFilter(params.filter), toYearMonth(now()));
      if (conditions === null) return { items: [], total: 0 };

      const filter = await searchFilter(keyword);
      // 결과와 전체 개수를 한 요청으로 받는다 (count 는 range 와 상관없이 필터까지 적용한 전체 개수)
      const ordered = toOrderBy(params.sort).reduce(
        (q, o) => q.order(o.column, { ascending: o.ascending, nullsFirst: false }),
        withConditions(
          gachaTable().select(SUMMARY_SELECT, { count: "exact" }).or(filter),
          conditions
        )
      );
      const { data, error, count: total } = await ordered.range(offset, offset + limit - 1);

      // 무한 스크롤은 total 에서 멈추므로, 여기는 검색 중에 결과가 줄었을 때만 온다. 그래서 개수를 다시 센다.
      if (error?.code === RANGE_NOT_SATISFIABLE) {
        return { items: [], total: await countOnly(filter, conditions) };
      }
      if (error) fail("searchGacha", error);
      return { items: data.map(toGacha), total: total ?? data.length };
    },
  };
}
