import { memo } from "react";
import { Image } from "react-native";

import type { Gacha } from "@deckodecko/core";
import { GoodsCard, type GoodsCardBadge } from "@deckodecko/ui/native";

import { joinDot, useGachaDisplay } from "@/hooks/useGachaDisplay";
import { openGacha } from "@/lib/routes";

type Props = {
  gacha: Gacha;
  /** vertical: 홈 "새로 나왔어요" (가로 스크롤). horizontal: 인기 목록 · 검색 결과 */
  layout: "vertical" | "horizontal";
  /** 사진 위 배지. 검색 결과만 쓴다 (홈 · 인기 시안에는 없다) */
  badge?: GoodsCardBadge | null;
};

/**
 * 가챠 한 종을 GoodsCard 로 그린다. 누르면 상세로 간다.
 * 목록이 다시 그려져도 같은 gacha · badge 면 다시 그리지 않는다 (memo). badge 는 객체라 쓰는 쪽이 매번 새로 만들지 않게 한다.
 * 이름은 GoodsCard 가 들어오기 전 자리 표시였을 때 그대로다 (다른 브랜치가 이 이름으로 import 한다).
 */
export const GachaCardSlot = memo(function GachaCardSlot({ gacha, layout, badge }: Props) {
  const display = useGachaDisplay(gacha);
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
});
