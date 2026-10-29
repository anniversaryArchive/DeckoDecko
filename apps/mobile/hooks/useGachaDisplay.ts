import { useTranslation } from "react-i18next";

import type { Gacha } from "@deckodecko/core";

import { gachaName, mediaTitle } from "@/lib/displayName";
import { formatItemCount, formatMonth, formatPrice } from "@/lib/i18n";

/** 가챠 카드 · 목록 줄 · 상세가 같이 쓰는 표시용 문구. 값이 없는 항목은 null. */
export type GachaDisplay = {
  /** 현재 언어에 맞는 가챠 이름 */
  name: string;
  /** 작품 이름 */
  media: string | null;
  /** 가격만 ("400엔") */
  price: string | null;
  /** 1회 가격 ("1회 400엔") */
  pricePerPlay: string | null;
  /** 발매월 ("2026년 10월 발매") */
  release: string | null;
  /** 발매 예정일 때의 발매월 ("2026년 11월 발매 예정"). 예정인지는 쓰는 쪽이 releaseStatus 로 정한다 */
  releaseUpcoming: string | null;
  /** 종 수 ("전 6종") */
  itemTotal: string | null;
};

export function useGachaDisplay(
  gacha: Pick<Gacha, "name" | "nameKo" | "media" | "price" | "releaseMonth" | "itemCount">
): GachaDisplay {
  const { t, i18n } = useTranslation();
  const price = gacha.price != null ? formatPrice(gacha.price) : null;
  return {
    name: gachaName(gacha, i18n.language),
    media: gacha.media ? mediaTitle(gacha.media, i18n.language) : null,
    price,
    pricePerPlay: price != null ? t("common.pricePerPlay", { price }) : null,
    release:
      gacha.releaseMonth != null
        ? t("common.released", { month: formatMonth(gacha.releaseMonth) })
        : null,
    releaseUpcoming:
      gacha.releaseMonth != null
        ? t("common.releaseUpcoming", { month: formatMonth(gacha.releaseMonth) })
        : null,
    itemTotal:
      gacha.itemCount != null
        ? t("common.itemTotal", { total: formatItemCount(gacha.itemCount) })
        : null,
  };
}

/** 값이 있는 조각만 " · " 로 잇는다. 모두 비면 "". */
export function joinDot(parts: (string | null | undefined)[]): string {
  return parts.filter((part): part is string => !!part).join(" · ");
}

/** 화면 읽기 이름: 값이 있는 조각만 ", " 로 잇는다 (" · " 는 기호로 읽힐 수 있어서). */
export function joinLabel(parts: (string | null | undefined)[]): string {
  return parts.filter((part): part is string => !!part).join(", ");
}
