import type { GachaFilter, GachaReleaseFilter, GachaSort } from "@deckodecko/core";

import { formatPrice, i18n } from "@/lib/i18n";

/** 칩 "전체 · 신상품 · 발매 예정" 순서. 하나만 고른다. */
export const RELEASE_FILTERS: readonly GachaReleaseFilter[] = ["all", "new", "upcoming"];

/** 정렬 시트 순서. 기본값은 core 의 GACHA_DEFAULTS.searchSort. */
export const SORTS: readonly GachaSort[] = ["release", "priceAsc", "priceDesc"];

/**
 * 가격 시트의 범위 (엔, 양 끝 포함). 가챠는 대개 100엔 단위라 300 이하 · 400–500 · 600 이상 세 칸으로 나눴다.
 * 범위를 바꾸면 label 의 문구 모양(upTo · between · from)도 같이 맞춘다.
 */
export type PriceRange = { id: string; min: number | null; max: number | null };

export const PRICE_RANGES: readonly PriceRange[] = [
  { id: "upTo300", min: null, max: 300 },
  { id: "400to500", min: 400, max: 500 },
  { id: "from600", min: 600, max: null },
];

/** 범위 문구 ("300엔 이하", "400엔 ~ 500엔", "600엔 이상"). 현재 언어를 따른다. */
export function priceRangeLabel({ min, max }: Pick<PriceRange, "min" | "max">): string {
  if (min != null && max != null) {
    return i18n.t("search.priceRange.between", { min: formatPrice(min), max: formatPrice(max) });
  }
  if (max != null) return i18n.t("search.priceRange.upTo", { price: formatPrice(max) });
  if (min != null) return i18n.t("search.priceRange.from", { price: formatPrice(min) });
  return i18n.t("search.priceRange.any");
}

/** 지금 필터의 가격 조건과 같은 범위. 없으면 undefined (가격 전체). */
export function findPriceRange(filter: GachaFilter): PriceRange | undefined {
  return PRICE_RANGES.find(
    (r) => r.min === (filter.priceMin ?? null) && r.max === (filter.priceMax ?? null)
  );
}
