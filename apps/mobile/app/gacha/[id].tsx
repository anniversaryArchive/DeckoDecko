import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { gachaCollection, type GachaDetail, type Item } from "@deckodecko/core";
import { useFolders, useGacha, useItemCounts, useItems } from "@deckodecko/core/react";
import { gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Button, Card, Text } from "@deckodecko/ui/native";

import { GachaCollectionCard } from "@/components/GachaCollectionCard";
import { GACHA_HERO_HEIGHT, GachaHero } from "@/components/GachaHero";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { MyItemRow } from "@/components/MyItemRow";
import { QueryState } from "@/components/QueryState";
import { StateMessage } from "@/components/StateMessage";
import { joinDot, useGachaDisplay } from "@/hooks/useGachaDisplay";

/** 아이템 추가 버튼의 + 아이콘 */
const ADD_ICON_SIZE = 20;
/** 히어로 아래 끝이 상태 표시줄에 닿기 전 이만큼(px) 스크롤하는 동안 상태 표시줄 배경이 서서히 불투명해진다 */
const STATUS_BAR_FADE_DISTANCE = 60;

/**
 * 가챠 상세. 스택 헤더 없이 히어로 이미지 + 기본 정보 + 이 가챠 소장률 + 내 아이템, 아래에 아이템 추가 버튼.
 * 뒤로 버튼은 로딩 · 에러 상태에서도 보이도록 화면 위에 띄운다.
 */
export default function GachaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const gacha = useGacha(id);

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

// TODO(혜진): 아이템 추가 · 수정 시트가 병합되면 연결한다. 그 전까지는 눌러도 아무 일도 없다.
function openAddItemSheet(_gachaId: string) {}
function openEditItemSheet(_itemId: string) {}

function DetailContent({ gacha }: { gacha: GachaDetail }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { name, media, pricePerPlay, release, itemTotal } = useGachaDisplay(gacha);
  // 가격 뒤에 붙는 보조 문구: "(세금 포함) · 전 6종". 가격이 없으면 종 수만.
  const priceTail = joinDot([pricePerPlay != null ? t("common.taxIncluded") : null, itemTotal]);

  // 히어로가 상태 표시줄 뒤까지 깔려 있어 GACHA_HERO_HEIGHT 만큼 스크롤하면 히어로 끝이 상태 표시줄 아래 선에 닿는다
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const statusBarBackground = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [GACHA_HERO_HEIGHT - STATUS_BAR_FADE_DISTANCE, GACHA_HERO_HEIGHT],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: space[24] }}
      >
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

        <View style={{ paddingHorizontal: gutter, gap: space[18] }}>
          <DetailCollection gacha={gacha} />
          <MyItems gachaId={gacha.id} />
        </View>
      </Animated.ScrollView>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: colors.bg,
          },
          statusBarBackground,
        ]}
      />
      <View
        style={{
          paddingTop: space[12],
          paddingHorizontal: gutter,
          paddingBottom: insets.bottom + space[12],
        }}
      >
        <Button
          fullWidth
          icon={<Ionicons name="add" size={ADD_ICON_SIZE} color={colors.onPrimary} />}
          onPress={() => openAddItemSheet(gacha.id)}
        >
          {t("detail.addItem")}
        </Button>
      </View>
    </View>
  );
}

/** 이 가챠 소장률: 가진(GET) 수 / 라인업(gacha_items) 종 수 */
function DetailCollection({ gacha }: { gacha: GachaDetail }) {
  const counts = useItemCounts(gacha.id);
  // 읽는 중 · 실패면 0 으로 그린다. 다시 시도 안내는 아래 목록의 QueryState 가 한다
  const collection = gachaCollection(counts.data ?? { wish: 0, get: 0 }, gacha.items.length);
  return <GachaCollectionCard collection={collection} />;
}

/** 내 아이템: 이 가챠의 WISH · GET 기록 (최근에 추가한 것부터) */
function MyItems({ gachaId }: { gachaId: string }) {
  const { t } = useTranslation();
  const items = useItems({ gachaId });
  const folderName = useFolderName();
  const count = items.data?.length ?? 0;

  return (
    <View style={{ gap: space[10] }}>
      <Text variant="titleMd" accessibilityRole="header">
        {t("detail.myItems", { count })}
      </Text>
      <QueryState
        query={items}
        isEmpty={(list) => list.length === 0}
        empty={<StateMessage message={t("detail.myItemsEmpty")} />}
      >
        {(list) => (
          <Card style={{ paddingVertical: space[4], paddingHorizontal: space[14] }}>
            {list.map((item, i) => (
              <MyItemRow
                key={item.id}
                item={item}
                detail={joinDot([folderName(item), item.memo ? t("detail.hasMemo") : null])}
                last={i === list.length - 1}
                onPress={() => openEditItemSheet(item.id)}
              />
            ))}
          </Card>
        )}
      </QueryState>
    </View>
  );
}

/** 기록이 든 폴더의 표시 이름. 기본 폴더는 이름이 비어 있어 i18n 문구로, 폴더 목록을 아직 못 읽었으면 null. */
function useFolderName() {
  const { t } = useTranslation();
  const folders = useFolders();
  const names = useMemo(
    () =>
      new Map(
        (folders.data ?? []).map((f) => [f.id, f.isDefault ? t("folder.defaultName") : f.name])
      ),
    [folders.data, t]
  );
  return (item: Item) => names.get(item.folderId) ?? null;
}
