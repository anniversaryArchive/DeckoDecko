import { useTranslation } from "react-i18next";
import { Image } from "react-native";

import { releaseStatus, toYearMonth, type Gacha } from "@deckodecko/core";
import { GoodsCard, type GoodsCardBadge } from "@deckodecko/ui/native";

import { joinDot, useGachaDisplay } from "@/hooks/useGachaDisplay";
import { openGacha } from "@/lib/routes";

type Props = {
  gacha: Gacha;
  /** vertical: 홈 "새로 나왔어요" (가로 스크롤). horizontal: 인기 목록 · 검색 결과 */
  layout: "vertical" | "horizontal";
};

/**
 * 가챠 한 종을 GoodsCard 로 그린다. 누르면 상세로 간다.
 * 이번 달 발매면 "NEW", 다음 달 이후면 "발매 예정" 배지 (검색 필터의 신상품 · 발매 예정과 같은 기준, 기기 시간).
 * 이름은 GoodsCard 가 들어오기 전 자리 표시였을 때 그대로다 (다른 브랜치가 이 이름으로 import 한다).
 */
export function GachaCardSlot({ gacha, layout }: Props) {
  const { t } = useTranslation();
  const display = useGachaDisplay(gacha);
  const status = releaseStatus(gacha.releaseMonth, toYearMonth(new Date()));
  const badge: GoodsCardBadge | null =
    status === "new"
      ? { label: t("common.badgeNew"), tone: "accent" }
      : status === "upcoming"
        ? { label: t("common.badgeUpcoming"), tone: "get" }
        : null;
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
      meta={joinDot([display.release, display.itemTotal]) || null}
    />
  ) : (
    <GoodsCard {...common} price={display.price} />
  );
}
