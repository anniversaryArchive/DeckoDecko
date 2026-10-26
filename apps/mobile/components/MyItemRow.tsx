import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

import type { Item } from "@deckodecko/core";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { joinLabel } from "@/hooks/useGachaDisplay";

/** 썸네일 한 변 */
const THUMB_SIZE = 46;
/** WISH · GET 태그 높이 */
const TAG_HEIGHT = 30;

type Props = {
  item: Item;
  /** 이름 아래 보조 줄 ("기본 폴더 · 메모 있음") */
  detail: string;
  /** 마지막 행이면 아래 구분선을 그리지 않는다 */
  last: boolean;
  onPress: () => void;
  /** WISH · GET 태그를 눌렀을 때 */
  onToggleType: () => void;
};

/**
 * 가챠 상세 "내 아이템" 카드 안의 한 줄. 썸네일 · 이름 · 보조 줄 · WISH/GET 태그.
 * 썸네일은 사진을 앱 안에 복사해 두는 방식이 생기기 전이라 종류 색 면만 둔다 (item.thumbnail 은 사진첩 assetId).
 * 태그는 따로 누르는 버튼이다 (onToggleType). 아직 전환은 연결되지 않았다.
 * 추가 · 삭제되면 행이 페이드되고 아래 행이 자리를 옮긴다. 기기의 "동작 줄이기"를 따른다 (Reanimated 기본값 ReduceMotion.System).
 */
export function MyItemRow({ item, detail, last, onPress, onToggleType }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isGet = item.type === "GET";
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
      style={[
        { flexDirection: "row", alignItems: "center", gap: space[12], paddingVertical: space[10] },
        !last && { borderBottomWidth: border.divider, borderBottomColor: colors.lineSoft },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={joinLabel([item.name, detail, item.type])}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: space[12],
          opacity: pressed ? PRESSED_OPACITY : 1,
        })}
      >
        <View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.thumb,
            backgroundColor: isGet ? colors.getSurface : colors.wishSurface,
          }}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {item.name}
          </Text>
          {detail !== "" && (
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {detail}
            </Text>
          )}
        </View>
      </Pressable>
      <Pressable
        onPress={onToggleType}
        accessibilityRole="button"
        accessibilityLabel={t("detail.toggleLabel", { name: item.name, type: item.type })}
        hitSlop={space[8]}
        style={({ pressed }) => ({
          height: TAG_HEIGHT,
          paddingHorizontal: space[12],
          borderRadius: radius.full,
          justifyContent: "center",
          backgroundColor: isGet ? colors.getSurface : colors.wishSurface,
          opacity: pressed ? PRESSED_OPACITY : 1,
        })}
      >
        <Text variant="captionSm" weight="bold" color={isGet ? "onGet" : "onWish"}>
          {item.type}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
