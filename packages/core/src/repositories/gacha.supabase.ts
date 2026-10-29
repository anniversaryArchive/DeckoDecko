import type { DeckoSupabaseClient } from "../supabase";
import { count, GACHA_DEFAULTS, resolveGachaFilter, toYearMonth } from "./gacha";
import type {
  GachaRepository,
  GachaRepositoryOptions,
  ListGachaParams,
  SearchGachaParams,
} from "./gacha";
import { toGacha, toGachaDetail, toGachaFromRpc } from "./gacha.supabase.mappers";
import { toDbId, toSearchRpcArgs } from "./gacha.supabase.params";
import {
  DETAIL_SELECT,
  SUMMARY_SELECT,
  type GachaRpcRow,
  type GachaSearchRpcRow,
} from "./gacha.supabase.rows";

type PostgrestErrorLike = { message: string; code?: string };

/** 실패는 throw 해서 React Query 의 error 상태로 보낸다. 빈 결과(빈 배열 · null)와 섞이지 않게 한다. */
function fail(action: string, error: PostgrestErrorLike): never {
  throw new Error(`[gacha.${action}] ${error.message}`, { cause: error });
}

/**
 * Supabase(PostgREST) 로 읽는 가챠 저장소. 계약은 GachaRepository 와 같다.
 *   - 최신순: created_at → id 내림차순.
 *   - 인기: RPC get_top_gacha_views. 최근 10일 조회 수가 많은 순이고, 조회가 없는 가챠는 빠진다 (그래서 limit 보다 적을 수 있다).
 *     조회 로그는 anon 이 읽을 수 없어 서버가 센다.
 *   - 검색: RPC search_gacha_with_anime. 가챠 이름(원문 · 한국어) · 작품명(한 · 일 · 영) · 작품 별칭에 부분 일치하고,
 *     필터 · 정렬 · 전체 개수까지 한 번에 받는다. 규칙은 메모리 구현과 같다 (인자 만들기는 gacha.supabase.params).
 * 행 타입 · select 는 gacha.supabase.rows, 행 → 도메인 매핑은 gacha.supabase.mappers, 요청 값 만들기는 gacha.supabase.params.
 */
export function createSupabaseGachaRepository(
  client: DeckoSupabaseClient,
  options: GachaRepositoryOptions = {}
): GachaRepository {
  const gachaTable = () => client.from("gacha");
  const now = options.now ?? (() => new Date());

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
      // 상한(50)은 RPC 가 건다
      const { data, error } = await client.rpc("get_top_gacha_views", {
        limit_count: count(limit, GACHA_DEFAULTS.popularLimit),
      });
      if (error) fail("listPopularGacha", error);
      const rows: GachaRpcRow[] = data;
      return rows.map(toGachaFromRpc);
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
      const limit = Math.min(
        count(params.limit, GACHA_DEFAULTS.searchLimit),
        GACHA_DEFAULTS.searchLimitMax
      );
      const offset = count(params.offset, GACHA_DEFAULTS.searchOffset, 0);
      const keyword = params.keyword.normalize("NFKC").trim();
      if (!keyword) return { items: [], total: 0 };
      const args = toSearchRpcArgs({
        keyword,
        limit,
        offset,
        filter: resolveGachaFilter(params.filter),
        sort: params.sort,
        thisMonth: toYearMonth(now()),
      });
      if (args === null) return { items: [], total: 0 };

      const { data, error } = await client.rpc("search_gacha_with_anime", args);
      if (error) fail("searchGacha", error);
      const rows: GachaSearchRpcRow[] = data;
      if (rows.length > 0) {
        return { items: rows.map(toGachaFromRpc), total: rows[0]!.total_count ?? rows.length };
      }
      if (offset === 0) return { items: [], total: 0 };

      // 무한 스크롤은 total 에서 멈추므로, 여기는 검색 중에 결과가 줄어 offset 이 전체를 넘었을 때만 온다.
      // 빈 페이지에는 total_count 가 없어서 첫 행 하나만 다시 받아 개수를 센다 (같은 조건).
      const head = await client.rpc("search_gacha_with_anime", {
        ...args,
        limit_count: 1,
        offset_count: 0,
      });
      if (head.error) fail("searchGacha.count", head.error);
      const first: GachaSearchRpcRow | undefined = head.data[0];
      return { items: [], total: first?.total_count ?? 0 };
    },
  };
}
