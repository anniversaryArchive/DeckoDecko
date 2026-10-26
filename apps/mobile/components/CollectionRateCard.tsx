import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { collectionRate, type ItemCounts } from "@deckodecko/core";
import { useItemCounts } from "@deckodecko/core/react";
import { radius, space, useTheme, type ThemeColors } from "@deckodecko/ui";
import { Card, PRESSED_OPACITY, ProgressBar, Text } from "@deckodecko/ui/native";

import { formatNumber, formatPercent } from "@/lib/i18n";

import { QueryState } from "./QueryState";

/** "내 굿즈 보기" 옆 화살표 */
const LINK_ICON_SIZE = 14;
/** 소장률이 바뀔 때 막대가 차오르고 숫자가 따라 오르는 시간 */
const RATE_DURATION = 600;
/** 천천히 출발해 천천히 멈추는 곡선 (BottomSheet 와 같은 곡선) */
const RATE_EASING = Easing.bezier(0.4, 0, 0.2, 1);

/**
 * 홈 "내 굿즈 소장률" 카드. 로컬 DB 의 WISH · GET 개수(전체)로 소장률을 계산한다.
 * 개수 쿼리는 items 쿼리 키 아래에 있어서, 어디서든 기록을 추가 · 전환 · 삭제하면(쓰기 훅이 items 키를 무효화) 바로 다시 그려진다.
 */
export function CollectionRateCard() {
  const { t } = useTranslation();
  const counts = useItemCounts();
  return (
    <Card
      variant="highlight"
      style={{ padding: space[18], paddingBottom: space[16], gap: space[12] }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="label" color="textMuted" accessibilityRole="header">
          {t("home.collectionRate")}
        </Text>
        <GoodsLink />
      </View>
      <QueryState query={counts} empty={null}>
        {(data) => <CollectionRate counts={data} />}
      </QueryState>
    </Card>
  );
}

function CollectionRate({ counts }: { counts: ItemCounts }) {
  const { t } = useTranslation();
  const rate = collectionRate(counts);
  const displayRate = useAnimatedRate(rate);
  return (
    <View style={{ gap: space[12] }}>
      <View
        style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}
      >
        {/* 스크린 리더는 숫자가 오르는 중에도 최종 값을 읽는다 */}
        <Text variant="displayLg" color="accent" accessibilityLabel={formatPercent(rate)}>
          {formatPercent(displayRate)}
        </Text>
        <View style={{ flexDirection: "row", gap: space[6], paddingBottom: space[6] }}>
          <CountChip
            label={t("home.getCount", { value: formatNumber(counts.get) })}
            surface="getSurface"
            text="onGet"
          />
          <CountChip
            label={t("home.wishCount", { value: formatNumber(counts.wish) })}
            surface="wishSurface"
            text="onWish"
          />
        </View>
      </View>
      <ProgressBar
        variant="summary"
        value={displayRate / 100}
        accessibilityLabel={t("home.collectionRate")}
      />
    </View>
  );
}

/** 애니메이션 중 지금 화면에 보일 소장률(0 → rate 정수). 막대만 UI 스레드 값으로 그리면 Android 시작 직후처럼 JS 가 바쁠 때 숫자가 막대보다 늦어서, 숫자와 막대가 이 값 하나를 같이 쓴다. */
function useAnimatedRate(rate: number): number {
  // 켜져 있는데 0 에서 출발하면 첫 프레임에 0% 가 잠깐 보인다
  const start = useReducedMotion() ? rate : 0;
  const progress = useSharedValue(start);
  const [displayRate, setDisplayRate] = useState(start);

  useEffect(() => {
    progress.value = withTiming(rate, {
      duration: RATE_DURATION,
      easing: RATE_EASING,
      reduceMotion: ReduceMotion.System,
    });
    return () => cancelAnimation(progress);
  }, [progress, rate]);

  // 정수가 바뀔 때만 JS 로 넘긴다. 애니메이션은 목표값에서 정확히 끝나므로 마지막 숫자는 rate 와 같다.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (now, previous) => {
      if (now !== previous) scheduleOnRN(setDisplayRate, now);
    }
  );

  return displayRate;
}

/** 오른쪽 위 "내 굿즈 보기 ›" → 내 굿즈 탭 */
function GoodsLink() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.navigate("/goods")}
      accessibilityRole="link"
      accessibilityLabel={t("home.viewGoods")}
      hitSlop={space[10]}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      <Text variant="caption" weight="medium" color="accent">
        {t("home.viewGoods")}
      </Text>
      <Ionicons name="chevron-forward" size={LINK_ICON_SIZE} color={colors.accent} />
    </Pressable>
  );
}

/** GET · WISH 개수 알약. 공용 태그 컴포넌트가 없어 여기 둔다. */
function CountChip({
  label,
  surface,
  text,
}: {
  label: string;
  surface: keyof ThemeColors;
  text: keyof ThemeColors;
}) {
  const { colors } = useTheme();
  return (
    <Text
      variant="caption"
      weight="bold"
      color={text}
      style={{
        backgroundColor: colors[surface],
        borderRadius: radius.full,
        overflow: "hidden",
        paddingHorizontal: space[10],
        paddingVertical: space[4],
      }}
    >
      {label}
    </Text>
  );
}
