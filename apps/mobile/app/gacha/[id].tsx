import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { GachaDetail } from "@deckodecko/core";
import { useGacha } from "@deckodecko/core/react";
import { gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { GachaThumb } from "@/components/GachaThumb";
import { StateMessage } from "@/components/StateMessage";
import { gachaName, mediaTitle } from "@/lib/displayName";
import { formatItemCount, formatPrice, formatMonth } from "@/lib/i18n";

/** 히어로 이미지 높이 (위 safe area 제외) */
const HERO_HEIGHT = 300;
/** 히어로 아래 모서리. 시안 값 36 은 radius 토큰(sheet 28)보다 커서 이 화면 상수로 둔다. */
const HERO_RADIUS = 36;
/** 뒤로 버튼(원형) 한 변 */
const BACK_BUTTON_SIZE = 44;

/**
 * 가챠 상세. 스택 헤더 없이 히어로 이미지 + 기본 정보. 뒤로 버튼은 로딩 · 에러 상태에서도 보이도록 화면 위에 띄운다.
 * 소장률 · 내 아이템 · 아이템 추가는 2주차.
 */
export default function GachaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: gacha, isLoading, isError, refetch } = useGacha(id);

  let body;
  if (isLoading) {
    body = <StateMessage fill loading message={t("common.loading")} />;
  } else if (isError) {
    body = <StateMessage fill message={t("common.loadFailed")} onRetry={() => void refetch()} />;
  } else if (!gacha) {
    body = <StateMessage fill message={t("detail.notFound", { id })} />;
  } else {
    body = <DetailContent gacha={gacha} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {body}
      <BackButton />
    </View>
  );
}

function BackButton() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
      style={({ pressed }) => ({
        position: "absolute",
        top: insets.top + space[16],
        left: space[20],
        width: BACK_BUTTON_SIZE,
        height: BACK_BUTTON_SIZE,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="chevron-back" size={20} color={colors.text} />
    </Pressable>
  );
}

function DetailContent({ gacha }: { gacha: GachaDetail }) {
  const { t, i18n } = useTranslation();
  const media = gacha.media ? mediaTitle(gacha.media, i18n.language) : null;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const release =
    gacha.releaseMonth != null
      ? t("common.released", { month: formatMonth(gacha.releaseMonth) })
      : null;
  const price =
    gacha.price != null ? t("common.pricePerPlay", { price: formatPrice(gacha.price) }) : null;
  // 가격 뒤에 붙는 보조 문구: "(세금 포함) · 전 6종". 가격이 없으면 종 수만.
  const priceTail = [
    price != null ? t("common.taxIncluded") : null,
    gacha.itemCount != null
      ? t("common.itemTotal", { total: formatItemCount(gacha.itemCount) })
      : null,
  ]
    .filter((v) => v != null)
    .join(" · ");

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[24] }}>
      <View
        style={{
          height: HERO_HEIGHT + insets.top,
          backgroundColor: colors.accentSoft,
          borderBottomLeftRadius: HERO_RADIUS,
          borderBottomRightRadius: HERO_RADIUS,
          overflow: "hidden",
        }}
      >
        <GachaThumb imageUrl={gacha.imageUrl} borderRadius={0} />
      </View>

      <View style={{ paddingVertical: space[20], paddingHorizontal: gutter, gap: space[6] }}>
        {(media != null || release != null) && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: space[8] }}>
            {media != null && (
              <Text
                variant="captionSm"
                weight="bold"
                color="onGet"
                style={{
                  backgroundColor: colors.getSurface,
                  borderRadius: radius.full,
                  overflow: "hidden",
                  paddingHorizontal: space[10],
                  paddingVertical: space[2],
                }}
              >
                {media}
              </Text>
            )}
            {release != null && (
              <Text variant="caption" color="textMuted">
                {release}
              </Text>
            )}
          </View>
        )}
        <Text variant="headingLg" accessibilityRole="header">
          {gachaName(gacha, i18n.language)}
        </Text>
        {(price != null || priceTail !== "") && (
          <Text variant="body" weight="bold" color="accent">
            {price}
            {price != null && priceTail !== "" ? " " : null}
            {priceTail !== "" && (
              <Text variant="body" color="textMuted">
                {priceTail}
              </Text>
            )}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
