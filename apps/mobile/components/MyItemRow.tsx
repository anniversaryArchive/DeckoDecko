import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

import type { Item } from "@deckodecko/core";
import { useDisplayedItemType } from "@deckodecko/core/react";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { ITEM_TYPE_BADGE, ItemTypeTag, useItemTypeStyles } from "@/components/ItemTypeTag";
import { joinLabel } from "@/hooks/useGachaDisplay";

/** 썸네일 한 변 */
const THUMB_SIZE = 46;

type Props = {
  item: Item;
  /** 이름 아래 보조 줄 ("기본 폴더 · 메모 있음") */
  detail: string;
  /** 마지막 행이면 아래 구분선을 그리지 않는다 */
  last: boolean;
  /** 행을 눌렀을 때. 행이 다시 그려지지 않게 고정된 함수를 넘긴다 */
  onPress: (itemId: string) => void;
  /** WISH · GET 태그를 눌렀을 때. 고정된 함수를 넘긴다 (useToggleItemType) */
  onToggleType: (item: Item) => void;
};

/**
 * 가챠 상세 "내 아이템" 카드 안의 한 줄. 썸네일 · 이름 · 보조 줄 · WISH/GET 태그.
 * 썸네일은 사진을 앱 안에 복사해 두는 방식이 생기기 전이라 종류 색 면만 둔다 (item.thumbnail 은 로컬 파일 URI).
 * 태그는 따로 누르는 버튼이다 (onToggleType). 전환을 저장하는 동안에는 item.type 보다 누른 값이 먼저 보인다.
 * memo 라서 props 가 그대로면 목록이 다시 그려져도 건너뛴다 (item 은 쿼리의 구조 공유로 바뀐 것만 새 객체).
 * 추가 · 삭제되면 행이 페이드되고 아래 행이 자리를 옮긴다. 기기의 "동작 줄이기"를 따른다 (Reanimated 기본값 ReduceMotion.System).
 */
export const MyItemRow = memo(function MyItemRow({
  item,
  detail,
  last,
  onPress,
  onToggleType,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const type = useDisplayedItemType(item);
  const typeStyles = useItemTypeStyles(type);
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
        onPress={() => onPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={joinLabel([item.name, detail, t(ITEM_TYPE_BADGE[type])])}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: space[12],
          opacity: pressed ? PRESSED_OPACITY : 1,
        })}
      >
        <Animated.View
          style={[
            { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: radius.thumb },
            typeStyles.surface,
          ]}
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
      <ItemTypeTag
        type={type}
        name={item.name}
        styles={typeStyles}
        onPress={() => onToggleType(item)}
      />
    </Animated.View>
  );
});
