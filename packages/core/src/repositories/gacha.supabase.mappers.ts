import type { Gacha, GachaDetail, GachaItem, Media, MediaKind } from "../types";
import type {
  AnimeRow,
  GachaBaseRow,
  GachaDetailRow,
  GachaSummaryRow,
} from "./gacha.supabase.rows";

// 행 → 도메인 매핑. DB 컬럼 이름(snake_case)은 gacha.supabase.* 밖으로 나가지 않는다.

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
  };
}

function toGachaBase(row: GachaBaseRow, itemCount: number): Gacha {
  return {
    id: String(row.id),
    // 레거시 데이터는 원문 이름이 null · 빈 문자열인 행이 있다. 한국어 이름으로 채운다.
    name: row.name?.trim() || row.name_kr?.trim() || "",
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
