import { Image, View } from "react-native";

import type { Gacha, ItemType } from "@deckodecko/core";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { Card, Text } from "@deckodecko/ui/native";

import { joinLabel, useGachaDisplay } from "@/hooks/useGachaDisplay";

/** 썸네일 한 변 */
const THUMB_SIZE = 76;

/** 가챠 정보가 없을 때 이름만 채워 표시용 문구를 만든다 */
const NO_GACHA = {
  nameKo: null,
  media: null,
  price: null,
  releaseMonth: null,
  itemCount: null,
} satisfies Omit<Parameters<typeof useGachaDisplay>[0], "name">;

type Props = {
  /** 가챠 정보를 아직 못 받았거나 카탈로그에 없으면 null (이름 자리에 fallbackName) */
  gacha: Gacha | null;
  fallbackName: string;
  /** 지금 보고 있는 종류. 개수 배지의 색 */
  type: ItemType;
  /** 개수 배지 글자 ("3개") */
  countLabel: string;
  /** 폴더 분포 ("기본 폴더 1, 별의 숲 2") */
  folders: string;
  onPress: () => void;
};

/** 내 굿즈 묶어보기의 가챠 한 줄: 썸네일 · 작품명 · 가챠 이름 · 폴더 분포 · 개수. 누르면 상세. */
export function GoodsGachaRow({ gacha, fallbackName, type, countLabel, folders, onPress }: Props) {
  const { colors } = useTheme();
  const display = useGachaDisplay(gacha ?? { ...NO_GACHA, name: fallbackName });
  const isGet = type === "GET";
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={joinLabel([display.media, display.name, folders, countLabel])}
      style={{ padding: space[10] }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: space[12] }}>
        <View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.field,
            borderWidth: border.divider,
            borderColor: colors.lineSoft,
            backgroundColor: colors.accentSoft,
            overflow: "hidden",
          }}
        >
          {gacha?.imageUrl ? (
            <Image
              source={{ uri: gacha.imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: space[4] }}>
          <Text variant="captionSm" color="textMuted" numberOfLines={1}>
            {display.media ?? ""}
          </Text>
          <Text variant="bodyStrong" numberOfLines={2}>
            {display.name}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {folders}
          </Text>
        </View>
        <Text
          variant="caption"
          weight="bold"
          color={isGet ? "onGet" : "onWish"}
          style={{
            backgroundColor: isGet ? colors.getSurface : colors.wishSurface,
            borderRadius: radius.full,
            overflow: "hidden",
            paddingHorizontal: space[8],
            paddingVertical: space[4],
          }}
        >
          {countLabel}
        </Text>
      </View>
    </Card>
  );
}
