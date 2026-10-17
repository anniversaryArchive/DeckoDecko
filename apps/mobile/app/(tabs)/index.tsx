import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Gacha } from "@deckodecko/core";
import { useGachaList, usePopularGacha } from "@deckodecko/core/react";
import { border, gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { GachaThumb } from "@/components/GachaThumb";
import { RankedGachaList } from "@/components/RankedGachaList";
import { SectionHeader } from "@/components/SectionHeader";
import { StateMessage } from "@/components/StateMessage";
import { gachaName, mediaTitle } from "@/lib/displayName";
import { formatPrice } from "@/lib/i18n";

/** 상단 원형 검색 버튼 한 변 */
const ICON_BUTTON_SIZE = 44;
/** 상단 검색 버튼 안 아이콘 */
const ICON_SIZE = 20;
/** "새로 나왔어요" 카드 폭 · 이미지 높이 */
const CARD_WIDTH = 156;
const CARD_IMAGE_HEIGHT = 140;

/** 홈. 상단 바 · 새로 나왔어요(가로 카드) · 지금 인기(순위 목록). 공지 띠 · 소장률 카드는 2주차 이후. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const latest = useGachaList();
  const popular = usePopularGacha();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: insets.top + space[24],
          paddingHorizontal: gutter,
          paddingBottom: space[10],
        }}
      >
        <Text variant="headingSm" accessibilityRole="header">
          {t("common.appName")}
        </Text>
        <Pressable
          onPress={() => router.push("/search")}
          accessibilityRole="button"
          accessibilityLabel={t("search.title")}
          style={({ pressed }) => ({
            width: ICON_BUTTON_SIZE,
            height: ICON_BUTTON_SIZE,
            borderRadius: radius.full,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderWidth: border.default,
            borderColor: colors.line,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="search" size={ICON_SIZE} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: space[6], paddingBottom: space[24], gap: space[24] }}
      >
        <Section
          header={<SectionHeader title={t("home.newArrivals")} badge={t("home.newBadge")} />}
        >
          {latest.isPending ? (
            <StateMessage loading message={t("common.loading")} />
          ) : latest.isError ? (
            <StateMessage message={t("common.loadFailed")} onRetry={() => void latest.refetch()} />
          ) : latest.data.length === 0 ? (
            <StateMessage message={t("home.empty")} />
          ) : (
            <FlatList
              horizontal
              data={latest.data}
              keyExtractor={(gacha) => gacha.id}
              renderItem={({ item }) => <NewGachaCard gacha={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: gutter, gap: space[12] }}
            />
          )}
        </Section>

        <Section
          header={<SectionHeader title={t("home.popular")} caption={t("common.last10Days")} />}
        >
          <View style={{ paddingHorizontal: gutter }}>
            {popular.isPending ? (
              <StateMessage loading message={t("common.loading")} />
            ) : popular.isError ? (
              <StateMessage
                message={t("common.loadFailed")}
                onRetry={() => void popular.refetch()}
              />
            ) : popular.data.length === 0 ? (
              <StateMessage message={t("home.empty")} />
            ) : (
              <RankedGachaList gachas={popular.data} />
            )}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

/** 섹션 = 제목(좌우 gutter) + 14 아래 내용. 내용의 좌우 여백은 내용 쪽에서 준다 (가로 스크롤은 끝까지 닿아야 해서). */
function Section({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: space[14] }}>
      <View style={{ paddingHorizontal: gutter }}>{header}</View>
      {children}
    </View>
  );
}

/** "새로 나왔어요" 가로 카드. 홈에서만 쓴다. */
function NewGachaCard({ gacha }: { gacha: Gacha }) {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const name = gachaName(gacha, i18n.language);
  const media = gacha.media ? mediaTitle(gacha.media, i18n.language) : null;
  const price = gacha.price != null ? formatPrice(gacha.price) : null;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/gacha/[id]", params: { id: gacha.id } })}
      accessibilityRole="link"
      accessibilityLabel={[media, name, price].filter(Boolean).join(", ")}
      style={({ pressed }) => ({
        width: CARD_WIDTH,
        borderRadius: radius.card,
        backgroundColor: colors.surface,
        borderWidth: border.default,
        borderColor: colors.line,
        overflow: "hidden",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ height: CARD_IMAGE_HEIGHT }}>
        <GachaThumb imageUrl={gacha.imageUrl} borderRadius={0} />
      </View>
      <View
        style={{
          gap: space[2],
          paddingTop: space[12],
          paddingHorizontal: space[14],
          paddingBottom: space[14],
        }}
      >
        {media != null && (
          <Text variant="captionSm" color="textMuted" numberOfLines={1}>
            {media}
          </Text>
        )}
        <Text variant="bodyStrong" numberOfLines={2}>
          {name}
        </Text>
        {price && (
          <Text variant="caption" weight="bold" color="accent">
            {price}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
