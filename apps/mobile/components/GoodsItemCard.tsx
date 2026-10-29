import { useState } from "react";
import { Image, View, type StyleProp, type ViewStyle } from "react-native";

import type { Item } from "@deckodecko/core";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { Card, Text } from "@deckodecko/ui/native";

import { joinLabel } from "@/hooks/useGachaDisplay";
import { photoUri } from "@/lib/photos";

/** 사진 높이 */
const IMAGE_HEIGHT = 150;

type Props = {
  item: Item;
  /** 폴더 표시 이름 (이름 위 작은 글자). 폴더 목록을 아직 못 읽었으면 null */
  folder: string | null;
  /** 가챠 표시 이름 (이름 아래). 가챠 정보를 아직 못 받았으면 null */
  gacha: string | null;
  /** 내 사진이 없을 때 쓰는 가챠 이미지 */
  gachaImageUrl: string | null;
  onPress: () => void;
  /** 2열 그리드의 폭 */
  style?: StyleProp<ViewStyle>;
};

/**
 * 내 굿즈 풀어보기의 아이템 카드: 사진 + WISH/GET 태그 · 폴더 · 이름 · 가챠 이름. 누르면 수정 시트.
 * 사진은 내가 고른 사진, 없거나 파일이 사라졌으면 가챠 이미지, 그것도 없으면 종류 색 면.
 */
export function GoodsItemCard({ item, folder, gacha, gachaImageUrl, onPress, style }: Props) {
  const { colors } = useTheme();
  const isGet = item.type === "GET";
  // 사진 파일을 읽지 못하면(앱 폴더로 복사하기 전에 저장한 임시 주소 등) 가챠 이미지로 바꾼다. 사진을 바꾸면 다시 시도한다
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const photo = item.thumbnail ? photoUri(item.thumbnail) : null;
  const uri = (photo !== failedUri && photo) || gachaImageUrl;
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={joinLabel([item.name, gacha, folder, item.type])}
      style={style}
    >
      <View
        style={{
          height: IMAGE_HEIGHT,
          backgroundColor: isGet ? colors.getSurface : colors.wishSurface,
          borderBottomWidth: border.default,
          borderBottomColor: colors.lineSoft,
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            onError={() => {
              if (uri === photo) setFailedUri(uri);
            }}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <Text
          variant="captionXs"
          color={isGet ? "onGet" : "onWish"}
          style={{
            position: "absolute",
            top: space[8],
            right: space[8],
            backgroundColor: isGet ? colors.getSurface : colors.wishSurface,
            borderRadius: radius.full,
            overflow: "hidden",
            paddingHorizontal: space[8],
            paddingVertical: space[2],
          }}
        >
          {item.type}
        </Text>
      </View>
      <View
        style={{
          paddingTop: space[10],
          paddingHorizontal: space[12],
          paddingBottom: space[12],
          gap: space[2],
        }}
      >
        <Text variant="captionXs" weight="regular" color="textMuted" numberOfLines={1}>
          {folder ?? ""}
        </Text>
        <Text variant="label" weight="bold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="captionSm" color="textMuted" numberOfLines={1}>
          {gacha ?? ""}
        </Text>
      </View>
    </Card>
  );
}
