import type { Tables } from "../database.types";

/** 목록 · 검색 · 상세가 같이 쓰는 select. 작품은 FK(gacha.anime_id) 로 붙인다. */
const ANIME_COLUMNS = "id, kr_title, jp_title, en_title, type" as const;
const GACHA_COLUMNS =
  `id, name, name_kr, image_link, price, release_month, anime(${ANIME_COLUMNS})` as const;

/** 목록 · 검색. 라인업은 개수만 받는다 (PostgREST 의 embedded count). */
export const SUMMARY_SELECT = `${GACHA_COLUMNS}, gacha_items(count)` as const;
/** 상세. 라인업을 다 받는다. */
export const DETAIL_SELECT =
  `${GACHA_COLUMNS}, gacha_items(id, gacha_id, name, name_kr, image_link, sort_order)` as const;

export type AnimeRow = Pick<Tables<"anime">, "id" | "kr_title" | "jp_title" | "en_title" | "type">;
export type GachaBaseRow = Pick<
  Tables<"gacha">,
  "id" | "name" | "name_kr" | "image_link" | "price" | "release_month"
> & { anime: AnimeRow | null };
export type GachaSummaryRow = GachaBaseRow & { gacha_items: { count: number }[] };
export type GachaItemRow = Pick<
  Tables<"gacha_items">,
  "id" | "gacha_id" | "name" | "name_kr" | "image_link" | "sort_order"
>;
export type GachaDetailRow = GachaBaseRow & { gacha_items: GachaItemRow[] };
