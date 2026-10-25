import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import type { GachaCollection } from "@deckodecko/core";
import { radius, space, useTheme, type ThemeColors } from "@deckodecko/ui";
import { Card, Text } from "@deckodecko/ui/native";

/** 막대 칸 높이 · 범례 점 지름 */
const BAR_HEIGHT = 8;
/** 칸 색이 바뀌는 데 걸리는 시간(ms). 시안에 없어서 정했다 */
const SLOT_COLOR_DURATION = 250;

type Slot = keyof Pick<ThemeColors, "getMark" | "primary" | "line">;

/**
 * 가챠 상세의 "이 가챠 소장률" 카드. 라인업 한 종을 한 칸으로 GET · WISH · 미등록 순서로 칠한다.
 * TODO(#139): 막대는 공용 소장률 바(ProgressBar, PR #150)가 들어오면 그것으로 바꾼다. 지금은 이 파일 안의 임시 스타일.
 */
export function GachaCollectionCard({ collection }: { collection: GachaCollection }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { total, get, wish, missing, rate } = collection;

  const slots: Slot[] = [
    ...Array<Slot>(get).fill("getMark"),
    ...Array<Slot>(wish).fill("primary"),
    ...Array<Slot>(missing).fill("line"),
  ];
  const legend: { slot: Slot; label: string }[] = [
    { slot: "getMark", label: t("detail.collectionGet", { count: get }) },
    { slot: "primary", label: t("detail.collectionWish", { count: wish }) },
    { slot: "line", label: t("detail.collectionMissing", { count: missing }) },
  ];

  return (
    <Card style={{ paddingVertical: space[16], paddingHorizontal: space[18], gap: space[10] }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Text variant="label" weight="bold" color="textMuted">
          {t("detail.collectionTitle")}
        </Text>
        {total > 0 && (
          <Text variant="headingSm" color="accent">
            {t("detail.collectionOwned", { count: get })}
            <Text variant="label" weight="regular" color="textMuted">
              {t("detail.collectionRest", { total, rate })}
            </Text>
          </Text>
        )}
      </View>

      {total === 0 ? (
        <Text variant="caption" color="textMuted">
          {t("detail.noLineup")}
        </Text>
      ) : (
        <>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t("detail.collectionLabel", { count: get, total, rate })}
            accessibilityValue={{ min: 0, max: total, now: get }}
            style={{ flexDirection: "row", gap: space[4] }}
          >
            {slots.map((slot, i) => (
              <BarSlot key={i} color={colors[slot]} />
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[14] }}>
            {legend.map(({ slot, label }) => (
              <View
                key={slot}
                style={{ flexDirection: "row", alignItems: "center", gap: space[4] }}
              >
                <View
                  style={{
                    width: BAR_HEIGHT,
                    height: BAR_HEIGHT,
                    borderRadius: radius.full,
                    backgroundColor: colors[slot],
                  }}
                />
                <Text variant="caption" color="textMuted">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

/**
 * 막대 한 칸. 기록을 추가하거나 WISH ↔ GET 을 바꾸면 색이 서서히 바뀐다.
 * 기기의 "동작 줄이기"가 켜져 있으면 withTiming 이 바로 바꾼다 (기본값 ReduceMotion.System).
 */
function BarSlot({ color }: { color: string }) {
  const background = useSharedValue(color);
  useEffect(() => {
    background.value = withTiming(color, { duration: SLOT_COLOR_DURATION });
  }, [background, color]);
  const style = useAnimatedStyle(() => ({ backgroundColor: background.value }));
  return (
    <Animated.View style={[{ flex: 1, height: BAR_HEIGHT, borderRadius: radius.bar }, style]} />
  );
}
