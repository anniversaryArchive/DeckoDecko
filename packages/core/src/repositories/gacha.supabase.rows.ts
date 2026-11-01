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

/**
 * RPC(get_top_gacha_views)가 돌려주는 한 행. 가챠 칸과 작품 칸(anime_*)이 평평하게 온다.
 * 생성 타입은 returns table 칸을 모두 not null 로 적지만, 작품은 left join 이라 작품이 없는 가챠는 anime_* 가 null 이고
 * 가챠 칸도 테이블에서 null 을 허용한다. 그래서 여기서는 null 을 허용해 받는다.
 */
export type GachaRpcRow = {
  id: number;
  name: string | null;
  name_kr: string | null;
  image_link: string | null;
  price: number | null;
  release_month: string | null;
  anime_id: number | null;
  anime_kr_title: string | null;
  anime_jp_title: string | null;
  anime_en_title: string | null;
  anime_type: string | null;
  item_count: number | null;
};
