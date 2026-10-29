import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";

import type { Gacha, ReleaseStatus } from "@deckodecko/core";
import { GoodsCard, type GoodsCardBadge } from "@deckodecko/ui/native";

import { joinDot, useGachaDisplay } from "@/hooks/useGachaDisplay";
import { openGacha } from "@/lib/routes";

type Props = {
  gacha: Gacha;
  /** vertical: 홈 "새로 나왔어요" (가로 스크롤). horizontal: 인기 목록 · 검색 결과 */
  layout: "vertical" | "horizontal";
  /**
   * 발매 상태(core releaseStatus). 주면 사진 위에 NEW · 발매 예정 배지를 달고, 발매 예정이면 마지막 줄을 "… 발매 예정"으로 쓴다.
   * 검색 결과만 넘긴다 (홈 · 인기 시안의 카드에는 배지가 없다).
   */
  releaseStatus?: ReleaseStatus | null;
};

/**
 * 가챠 한 종을 GoodsCard 로 그린다. 누르면 상세로 간다.
 * 목록이 다시 그려져도 props 가 같으면 다시 그리지 않는다 (memo).
 * 이름은 GoodsCard 가 들어오기 전 자리 표시였을 때 그대로다 (다른 브랜치가 이 이름으로 import 한다).
 */
export const GachaCardSlot = memo(function GachaCardSlot({ gacha, layout, releaseStatus }: Props) {
  const { t } = useTranslation();
  const display = useGachaDisplay(gacha);
  const badge: GoodsCardBadge | null =
    releaseStatus === "new"
      ? { label: t("common.badgeNew"), tone: "accent" }
      : releaseStatus === "upcoming"
        ? { label: t("common.badgeUpcoming"), tone: "get" }
        : null;
  const release = releaseStatus === "upcoming" ? display.releaseUpcoming : display.release;
  const common = {
    image: gacha.imageUrl ? (
      <Image
        source={{ uri: gacha.imageUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    ) : null,
    caption: display.media,
    title: display.name,
    badge,
    onPress: () => openGacha(gacha.id),
  };
  return layout === "horizontal" ? (
    <GoodsCard
      {...common}
      layout="horizontal"
      price={display.pricePerPlay}
      meta={joinDot([release, display.itemTotal]) || null}
    />
  ) : (
    <GoodsCard {...common} price={display.price} />
  );
});
