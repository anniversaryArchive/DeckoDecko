import { useTranslation } from "react-i18next";
import { FlatList, Image, Pressable, ScrollView, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";

import { truncateKeyword, type Gacha } from "@deckodecko/core";
import {
  useClearRecentGacha,
  useClearRecentSearches,
  useRecentGacha,
  useRecentSearches,
  useRemoveRecentSearch,
} from "@deckodecko/core/react";
import { gutter, radius, space } from "@deckodecko/ui";
import { Chip, CloseIcon, GoodsCard, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { useGachaDisplay } from "@/hooks/useGachaDisplay";
import { openGacha } from "@/lib/routes";

import { QueryState } from "./QueryState";
import { SectionHeader } from "./SectionHeader";

/** 칩 안 × 버튼 지름 · 아이콘 (시안: 24 원 안의 ×) */
const REMOVE_SIZE = 24;
const REMOVE_ICON_SIZE = 10;
/** 칩 최소 폭. 짧은 검색어 칩도 정가운데를 누르면 × 가 아니라 글자 쪽(검색)이 잡히게 (× 왼쪽 끝 = 폭 - 36) */
const CHIP_MIN_WIDTH = 88;
/** 칩에 보이는 검색어 글자 수. 넘치면 줄임표 (읽기 이름은 전체) */
const KEYWORD_MAX_CHARS = 12;

// 좌우 여백(gutter)은 섹션이 준다. 가로 스크롤이 화면 끝까지 닿아야 해서 부모는 여백을 주지 않는다.

/**
 * 섹션 · 칩이 나타나고 사라지는 움직임. Animated.View 에 펼쳐 넣는다. 검색 화면의 인기 섹션도 layout 을 같이 쓴다.
 * 시스템 "동작 줄이기" 가 켜져 있으면 아예 넘기지 않는다. reanimated 에 맡기면(ReduceMotion.System)
 * iOS 에서 위 섹션이 늦게 생길 때 아래 섹션이 옛 자리에 남아 겹친다.
 */
export function useRecentMotion() {
  const reduced = useReducedMotion();
  return reduced ? {} : { entering: FadeIn, exiting: FadeOut, layout: LinearTransition };
}

/** 최근 검색어: 가로로 넘기는 칩. 칩을 누르면 그 검색어로 검색하고, × 는 그 검색어만 지운다. */
export function RecentSearchesSection({ onSelect }: { onSelect: (keyword: string) => void }) {
  const { t } = useTranslation();
  const searches = useRecentSearches();
  const remove = useRemoveRecentSearch();
  const clear = useClearRecentSearches();
  const motion = useRecentMotion();

  const list = searches.data ?? [];
  if (list.length === 0) return null;

  return (
    <Animated.View {...motion} style={{ gap: space[10] }}>
      <RecentHeader
        title={t("search.recentSearchesTitle")}
        clearLabel={t("search.clearRecentSearches")}
        onClear={() => clear.mutate()}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: gutter, gap: space[8] }}
      >
        {list.map((keyword) => {
          const removeLabel = t("search.removeRecentSearch", { keyword });
          return (
            <Animated.View key={keyword} {...motion}>
              <Chip
                style={{ minWidth: CHIP_MIN_WIDTH, justifyContent: "space-between" }}
                onPress={() => onSelect(keyword)}
                // 이름을 적지 않으면 iOS 가 안쪽 × 의 이름까지 붙여 "Vol, Vol 삭제" 로 읽는다 (누르면 검색인데)
                accessibilityLabel={keyword}
                // × 는 칩 안에 있어 화면 읽기에서는 따로 잡히지 않는다. 같은 일을 칩의 동작으로 연다.
                accessibilityActions={[{ name: "delete", label: removeLabel }]}
                onAccessibilityAction={(e) => {
                  if (e.nativeEvent.actionName === "delete") remove.mutate(keyword);
                }}
                trailing={
                  <Pressable
                    onPress={() => remove.mutate(keyword)}
                    accessibilityRole="button"
                    accessibilityLabel={removeLabel}
                    // 왼쪽(글자 쪽)은 넓히지 않는다. 짧은 검색어 칩은 넓히면 가운데를 눌러도 × 가 잡혀 지워진다
                    hitSlop={{ top: space[4], bottom: space[4], right: space[4] }}
                    style={({ pressed }) => ({
                      width: REMOVE_SIZE,
                      height: REMOVE_SIZE,
                      borderRadius: radius.full,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? PRESSED_OPACITY : 1,
                    })}
                  >
                    <CloseIcon size={REMOVE_ICON_SIZE} />
                  </Pressable>
                }
              >
                {truncateKeyword(keyword, KEYWORD_MAX_CHARS)}
              </Chip>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

/**
 * 최근 본 굿즈: 가로로 넘기는 작은 세로 카드. 가챠 정보는 저장된 id 로 한 번에 다시 조회한다.
 * 불러오는 동안은 그리지 않는다 (요청 한 번이라 대개 금방 끝나고, 비었는지도 그때 알 수 있다).
 */
export function RecentGachaSection() {
  const { t } = useTranslation();
  const recent = useRecentGacha();
  const clear = useClearRecentGacha();
  const motion = useRecentMotion();

  const hasItems = (recent.data?.length ?? 0) > 0;
  if (!hasItems && !recent.isError) return null;

  return (
    <Animated.View {...motion} style={{ gap: space[10] }}>
      <RecentHeader
        title={t("search.recentGachaTitle")}
        clearLabel={t("search.clearRecentGacha")}
        onClear={() => clear.mutate()}
      />
      <QueryState query={recent} empty={null}>
        {(list) => (
          <FlatList
            horizontal
            data={list}
            keyExtractor={(gacha) => gacha.id}
            renderItem={({ item }) => <RecentGachaCard gacha={item} />}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: gutter, gap: space[10] }}
          />
        )}
      </QueryState>
    </Animated.View>
  );
}

/** 최근 본 굿즈 카드 (작은 세로 카드). 누르면 상세로 간다. 사진이 없으면(목 데이터) 카드의 면만 보인다. */
function RecentGachaCard({ gacha }: { gacha: Gacha }) {
  const { name, media } = useGachaDisplay(gacha);
  return (
    <GoodsCard
      size="sm"
      caption={media}
      title={name}
      image={
        gacha.imageUrl ? (
          <Image
            source={{ uri: gacha.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : null
      }
      onPress={() => openGacha(gacha.id)}
    />
  );
}

/** 섹션 제목 + 오른쪽 "전체 삭제" */
function RecentHeader({
  title,
  clearLabel,
  onClear,
}: {
  title: string;
  clearLabel: string;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: gutter,
      }}
    >
      <SectionHeader title={title} variant="titleMd" />
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel={clearLabel}
        // 글자는 작아도 누르는 자리는 44 정도가 되게 (시안: min-height 44)
        hitSlop={{ top: space[12], bottom: space[12], left: space[8], right: space[8] }}
        style={({ pressed }) => ({ opacity: pressed ? PRESSED_OPACITY : 1 })}
      >
        <Text variant="caption" color="textMuted">
          {t("search.clearAll")}
        </Text>
      </Pressable>
    </View>
  );
}
