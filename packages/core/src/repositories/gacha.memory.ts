import type { Gacha, GachaDetail } from "../types";
import { count, GACHA_DEFAULTS, releaseStatus, resolveGachaFilter, toYearMonth } from "./gacha";
import type {
  GachaRepository,
  GachaRepositoryOptions,
  GachaSort,
  ListGachaParams,
  ResolvedGachaFilter,
  SearchGachaParams,
} from "./gacha";

function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function toSummary(detail: GachaDetail): Gacha {
  const { items: _items, ...summary } = detail;
  return summary;
}

function matchesFilter(g: Gacha, filter: ResolvedGachaFilter, thisMonth: string): boolean {
  if (filter.release !== "all" && releaseStatus(g.releaseMonth, thisMonth) !== filter.release) {
    return false;
  }
  if (filter.mediaId != null && g.media?.id !== filter.mediaId) return false;
  if (filter.priceMin != null && !(g.price != null && g.price >= filter.priceMin)) return false;
  if (filter.priceMax != null && !(g.price != null && g.price <= filter.priceMax)) return false;
  return true;
}

/** null 을 맨 뒤로 보내는 비교. desc 면 큰 값부터. 같으면 0 (sort 가 안정 정렬이라 원래 순서 유지). */
function compareNullsLast<T extends string | number>(a: T | null, b: T | null, desc: boolean) {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return (a < b ? -1 : 1) * (desc ? -1 : 1);
}

const comparators: Record<GachaSort, (a: Gacha, b: Gacha) => number> = {
  release: (a, b) => compareNullsLast(a.releaseMonth, b.releaseMonth, true),
  priceAsc: (a, b) => compareNullsLast(a.price, b.price, false),
  priceDesc: (a, b) => compareNullsLast(a.price, b.price, true),
};

/**
 * 메모리 안의 배열로 동작하는 저장소. 목 데이터 화면(1주차), 테스트, 스토리북 성격의 개발 화면에 쓴다.
 * 데이터는 이 저장소가 갖지 않고 호출하는 쪽이 넘긴다 (개발용 목 데이터: @deckodecko/core/mocks).
 * 목록은 받은 순서를 최신순으로 본다. 검색은 가챠 이름(한 · 일) · 작품명(한 · 일 · 영) 부분 일치, 공백 · 대소문자 · 전각 무시.
 */
export function createMemoryGachaRepository(
  seed: readonly GachaDetail[],
  options: GachaRepositoryOptions = {}
): GachaRepository {
  const all = [...seed];
  const now = options.now ?? (() => new Date());

  return {
    async listGacha(params?: ListGachaParams) {
      return all.slice(0, count(params?.limit, GACHA_DEFAULTS.listLimit)).map(toSummary);
    },

    async listPopularGacha(limit?: number) {
      // 인기 집계는 3주차 RPC 몫. 그 전까지는 라인업 수(itemCount, 모르면 0)가 많은 순으로 흉내 낸다.
      return [...all]
        .sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0))
        .slice(0, count(limit, GACHA_DEFAULTS.popularLimit))
        .map(toSummary);
    },

    async listGachaByIds(ids: readonly string[]) {
      return ids.flatMap((id) => {
        const found = all.find((g) => g.id === id);
        return found ? [toSummary(found)] : [];
      });
    },

    async getGacha(id: string) {
      return all.find((g) => g.id === id) ?? null;
    },

    async searchGacha(params: SearchGachaParams) {
      const limit = count(params.limit, GACHA_DEFAULTS.searchLimit);
      const offset = count(params.offset, GACHA_DEFAULTS.searchOffset, 0);
      const filter = resolveGachaFilter(params.filter);
      const compare = comparators[params.sort ?? GACHA_DEFAULTS.searchSort] ?? comparators.release;
      const thisMonth = toYearMonth(now());
      const q = normalize(params.keyword);
      if (!q) return { items: [], total: 0 };
      const hits = all
        .filter((g) =>
          [g.name, g.nameKo, g.media?.title, g.media?.titleJa, g.media?.titleEn]
            .filter((v): v is string => typeof v === "string")
            .some((v) => normalize(v).includes(q))
        )
        .filter((g) => matchesFilter(g, filter, thisMonth))
        .sort(compare);
      return { items: hits.slice(offset, offset + limit).map(toSummary), total: hits.length };
    },
  };
}
