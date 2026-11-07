import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import type { ItemType } from "@deckodecko/core";
import { radius, space, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY, Text, useColorTransition } from "@deckodecko/ui/native";

/** 태그 높이 */
const TAG_HEIGHT = 30;
/** WISH 와 GET 의 글자 폭이 달라도 태그 폭이 그대로이도록 둘 다 들어가는 최소 폭 */
const TAG_MIN_WIDTH = 64;

const AnimatedText = Animated.createAnimatedComponent(Text);

/** 태그 글자 (i18n 키) */
export const ITEM_TYPE_BADGE = { WISH: "item.wishBadge", GET: "item.getBadge" } as const;

/** WISH · GET 면 색과 그 위 글자색 (색 역할 이름) */
export const ITEM_TYPE_COLORS = {
  WISH: { surface: "wishSurface", label: "onWish" },
  GET: { surface: "getSurface", label: "onGet" },
} as const;

/**
 * WISH · GET 면 색과 그 위 글자색. type 이 바뀌면 서서히 바뀐다 ("동작 줄이기"면 바로).
 * 한 행에서 한 번만 만들어 태그와 썸네일처럼 같은 색을 쓰는 면에 같이 넘긴다.
 */
export function useItemTypeStyles(type: ItemType) {
  const { colors } = useTheme();
  const surfaceColor = useColorTransition(colors[ITEM_TYPE_COLORS[type].surface]);
  const labelColor = useColorTransition(colors[ITEM_TYPE_COLORS[type].label]);
  const surface = useAnimatedStyle(() => ({ backgroundColor: surfaceColor.value }));
  const label = useAnimatedStyle(() => ({ color: labelColor.value }));
  return { surface, label };
}

export type ItemTypeStyles = ReturnType<typeof useItemTypeStyles>;

type Props = {
  /** 보이는 WISH · GET (useDisplayedItemType) */
  type: ItemType;
  /** 화면 읽기 이름에 넣는 아이템 이름 */
  name: string;
  /** useItemTypeStyles(type) 의 결과 */
  styles: ItemTypeStyles;
  /** 누르면 부른다. 바꾸기는 쓰는 쪽에서 (useToggleItemType) */
  onPress: () => void;
};

/**
 * 누르면 WISH ↔ GET 이 바뀌는 태그 버튼 (상세 내 아이템).
 * 화면 읽기 프로그램은 이름과 현재 상태를 읽고, 힌트로 누르면 바뀌는 상태를 읽는다.
 */
export function ItemTypeTag({ type, name, styles, onPress }: Props) {
  const { t } = useTranslation();
  const isGet = type === "GET";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("item.typeTagLabel", { name, type: t(ITEM_TYPE_BADGE[type]) })}
      accessibilityHint={t(isGet ? "item.toggleToWishHint" : "item.toggleToGetHint")}
      hitSlop={space[8]}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            {
              height: TAG_HEIGHT,
              minWidth: TAG_MIN_WIDTH,
              paddingHorizontal: space[12],
              borderRadius: radius.full,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? PRESSED_OPACITY : 1,
            },
            styles.surface,
          ]}
        >
          <AnimatedText variant="captionSm" weight="bold" style={styles.label}>
            {t(ITEM_TYPE_BADGE[type])}
          </AnimatedText>
        </Animated.View>
      )}
    </Pressable>
  );
}
