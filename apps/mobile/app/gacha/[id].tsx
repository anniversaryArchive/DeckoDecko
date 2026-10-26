import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
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
import { border, gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Button, Card, PRESSED_OPACITY, Text, useToast } from "@deckodecko/ui/native";

import { GachaCollectionCard } from "@/components/GachaCollectionCard";
import { GACHA_HERO_HEIGHT, GachaHero } from "@/components/GachaHero";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { MyItemRow } from "@/components/MyItemRow";
import { QueryState } from "@/components/QueryState";
import { StateMessage } from "@/components/StateMessage";
import { joinDot, useGachaDisplay } from "@/hooks/useGachaDisplay";

/** 아이템 추가 버튼의 + 아이콘 */
const ADD_ICON_SIZE = 20;
/** 사진 인식 버튼 지름. 옆 아이템 추가 버튼(Button lg) 높이와 같다 */
const AI_SCAN_SIZE = 54;
/** 사진 인식 버튼의 카메라 아이콘 */
const AI_SCAN_ICON_SIZE = 22;
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

type SheetCallbacks = {
  /** 시트가 저장에 실패하고 닫힐 때 부른다. reason 은 토스트 둘째 줄 ("같은 이름의 아이템이 이미 있어요") */
  onSaveFailed: (reason: string) => void;
};

// TODO(혜진): 아이템 추가 · 수정 시트가 병합되면 연결한다. 그 전까지는 눌러도 아무 일도 없다.
function openAddItemSheet(_gachaId: string, _callbacks: SheetCallbacks) {}
function openEditItemSheet(_itemId: string, _callbacks: SheetCallbacks) {}
// TODO(혜진): 사진 인식 화면이 생기면 연결한다. 그 전까지는 눌러도 아무 일도 없다.
function openAiScan(_gachaId: string) {}
// TODO(혜진): WISH ↔ GET 원탭 전환을 useSetItemType 으로 연결한다. 그 전까지는 눌러도 아무 일도 없다.
function toggleItemType(_item: Item) {}

/** 시트 저장 실패 토스트. "다시 열기"를 누르면 reopen 으로 시트를 다시 연다 */
function useSaveFailedToast() {
  const { t } = useTranslation();
  const toast = useToast();
  return (reason: string, reopen: () => void) =>
    toast.show({
      title: t("detail.saveFailed"),
      message: reason,
      actionLabel: t("detail.reopenSheet"),
      onAction: reopen,
    });
}

function DetailContent({ gacha }: { gacha: GachaDetail }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { name, media, pricePerPlay, release, itemTotal } = useGachaDisplay(gacha);
  // 가격 뒤에 붙는 보조 문구: "(세금 포함) · 전 6종". 가격이 없으면 종 수만.
  const priceTail = joinDot([pricePerPlay != null ? t("common.taxIncluded") : null, itemTotal]);
  const showSaveFailed = useSaveFailedToast();
  function openAdd() {
    openAddItemSheet(gacha.id, { onSaveFailed: (reason) => showSaveFailed(reason, openAdd) });
  }

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
          flexDirection: "row",
          gap: space[10],
          paddingTop: space[12],
          paddingHorizontal: gutter,
          paddingBottom: insets.bottom + space[12],
        }}
      >
        <Pressable
          onPress={() => openAiScan(gacha.id)}
          accessibilityRole="button"
          accessibilityLabel={t("detail.aiScan")}
          style={({ pressed }) => ({
            width: AI_SCAN_SIZE,
            height: AI_SCAN_SIZE,
            borderRadius: radius.full,
            borderWidth: border.default,
            borderColor: colors.primary,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <Ionicons name="camera-outline" size={AI_SCAN_ICON_SIZE} color={colors.accent} />
        </Pressable>
        <Button
          icon={<Ionicons name="add" size={ADD_ICON_SIZE} color={colors.onPrimary} />}
          onPress={openAdd}
          style={{ flex: 1 }}
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
  const showSaveFailed = useSaveFailedToast();
  const count = items.data?.length ?? 0;
  function openEdit(itemId: string) {
    openEditItemSheet(itemId, {
      onSaveFailed: (reason) => showSaveFailed(reason, () => openEdit(itemId)),
    });
  }

  return (
    <View style={{ gap: space[10] }}>
      <View
        style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}
      >
        <Text variant="titleMd" accessibilityRole="header">
          {t("detail.myItems", { count })}
        </Text>
        {count > 0 && (
          <Text variant="caption" color="textMuted">
            {t("detail.toggleHint")}
          </Text>
        )}
      </View>
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
                onPress={() => openEdit(item.id)}
                onToggleType={() => toggleItemType(item)}
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
