import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { GachaDetail } from "@deckodecko/core";
import { useGacha, useRecordRecentGacha } from "@deckodecko/core/react";
import { gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { GachaHero } from "@/components/GachaHero";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { QueryState } from "@/components/QueryState";
import { StateMessage } from "@/components/StateMessage";
import { joinDot, useGachaDisplay } from "@/hooks/useGachaDisplay";

/**
 * 가챠 상세. 스택 헤더 없이 히어로 이미지 + 기본 정보. 뒤로 버튼은 로딩 · 에러 상태에서도 보이도록 화면 위에 띄운다.
 * 소장률 · 내 아이템 · 아이템 추가는 2주차.
 */
export default function GachaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const gacha = useGacha(id);
  // 들어올 때마다 최근 본 굿즈(검색 탭)에 남긴다
  useRecordRecentGacha(id);

  return (
    <View style={{ flex: 1 }}>
      <QueryState
        query={gacha}
        fill
        empty={<StateMessage fill message={t("detail.notFound", { id })} />}
      >
        {(detail) => <DetailContent gacha={detail} />}
      </QueryState>
      <HeaderIconButton
        icon="chevron-back"
        variant="surface"
        label={t("common.back")}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        style={{ position: "absolute", top: insets.top + space[16], left: space[20] }}
      />
    </View>
  );
}

function DetailContent({ gacha }: { gacha: GachaDetail }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { name, media, pricePerPlay, release, itemTotal } = useGachaDisplay(gacha);
  // 가격 뒤에 붙는 보조 문구: "(세금 포함) · 전 6종". 가격이 없으면 종 수만.
  const priceTail = joinDot([pricePerPlay != null ? t("common.taxIncluded") : null, itemTotal]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[24] }}>
      <GachaHero imageUrl={gacha.imageUrl} />

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
          {name}
        </Text>
        {(pricePerPlay != null || priceTail !== "") && (
          <Text variant="body" weight="bold" color="accent">
            {pricePerPlay}
            {pricePerPlay != null && priceTail !== "" ? " " : null}
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
