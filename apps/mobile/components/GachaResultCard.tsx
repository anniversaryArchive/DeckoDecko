import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import type { Gacha } from "@deckodecko/core";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { gachaName, mediaTitle } from "@/lib/displayName";
import { formatItemCount, formatPrice, formatMonth } from "@/lib/i18n";

import { GachaThumb } from "./GachaThumb";

/** 썸네일 한 변 */
const THUMB_SIZE = 96;

/** 검색 결과 카드. 썸네일 96 + 작품명 / 이름 / 1회 가격 / 발매월 · 종 수. 값이 없는 줄 · 조각은 생략한다. */
export function GachaResultCard({ gacha }: { gacha: Gacha }) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const name = gachaName(gacha, i18n.language);
  const media = gacha.media ? mediaTitle(gacha.media, i18n.language) : null;
  const price =
    gacha.price != null ? t("common.pricePerPlay", { price: formatPrice(gacha.price) }) : null;
  const meta = [
    gacha.releaseMonth != null
      ? t("common.released", { month: formatMonth(gacha.releaseMonth) })
      : null,
    gacha.itemCount != null
      ? t("common.itemTotal", { total: formatItemCount(gacha.itemCount) })
      : null,
  ]
    .filter((v) => v != null)
    .join(" · ");

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/gacha/[id]", params: { id: gacha.id } })}
      accessibilityRole="link"
      accessibilityLabel={[media, name, price, meta].filter(Boolean).join(", ")}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: space[14],
        padding: space[12],
        borderRadius: radius.card,
        backgroundColor: colors.surface,
        borderWidth: border.default,
        borderColor: colors.line,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* 시안의 썸네일 모서리 16 은 radius.field 와 값이 같다. */}
      <GachaThumb imageUrl={gacha.imageUrl} size={THUMB_SIZE} borderRadius={radius.field} />
      <View style={{ flex: 1, gap: space[2] }}>
        {media != null && (
          <Text variant="captionSm" color="textMuted" numberOfLines={1}>
            {media}
          </Text>
        )}
        <Text variant="bodyStrong" numberOfLines={2}>
          {name}
        </Text>
        {price != null && (
          <Text variant="label" weight="bold" color="accent">
            {price}{" "}
            <Text variant="captionSm" color="textMuted">
              {t("common.taxIncluded")}
            </Text>
          </Text>
        )}
        {meta !== "" && (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {meta}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
