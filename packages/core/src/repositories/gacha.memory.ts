import type { Gacha, GachaDetail } from "../types";
import type { GachaRepository, ListGachaParams, SearchGachaParams } from "./gacha";

const DEFAULT_LIMIT = 20;

function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function toSummary(detail: GachaDetail): Gacha {
  const { items: _items, ...summary } = detail;
  return summary;
}

/**
 * 메모리 안의 배열로 동작하는 저장소. 목 데이터 화면(1주차), 테스트, 스토리북 성격의 개발 화면에 쓴다.
 * 데이터는 이 저장소가 갖지 않고 호출하는 쪽이 넘긴다 (개발용 목 데이터: @deckodecko/core/mocks).
 * 목록은 받은 순서를 최신순으로 본다. 검색은 가챠 이름(한 · 일) · 작품명(한 · 일 · 영) 부분 일치, 공백 · 대소문자 · 전각 무시.
 */
export function createMemoryGachaRepository(seed: readonly GachaDetail[]): GachaRepository {
  const all = [...seed];

  return {
    async listGacha(params?: ListGachaParams) {
      return all.slice(0, params?.limit ?? DEFAULT_LIMIT).map(toSummary);
    },

    async listPopularGacha(limit = 10) {
      // 인기 집계는 3주차 RPC 몫. 그 전까지는 라인업이 많은 순으로 흉내 낸다.
      return [...all]
        .sort((a, b) => b.items.length - a.items.length)
        .slice(0, limit)
        .map(toSummary);
    },

    async getGacha(id: string) {
      return all.find((g) => g.id === id) ?? null;
    },

    async searchGacha({ keyword, limit = DEFAULT_LIMIT, offset = 0 }: SearchGachaParams) {
      const q = normalize(keyword);
      if (!q) return { items: [], total: 0 };
      const hits = all.filter((g) =>
        [g.name, g.nameKo, g.media?.title, g.media?.titleJa, g.media?.titleEn]
          .filter((v): v is string => typeof v === "string")
          .some((v) => normalize(v).includes(q))
      );
      return { items: hits.slice(offset, offset + limit).map(toSummary), total: hits.length };
    },
  };
}
