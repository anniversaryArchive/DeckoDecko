import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";

import { radius, useTheme } from "@deckodecko/ui";

type Props = {
  imageUrl: string | null;
  /** 정사각형 한 변. 생략하면 부모 크기를 채운다 (부모가 너비 · 높이를 정한다). */
  size?: number;
  /** 모서리. 생략하면 radius.thumb. 부모가 잘라 주는 경우(카드 윗부분 · 상세 히어로)는 0. */
  borderRadius?: number;
};

/** 가챠 썸네일. 이미지가 없으면(목 데이터) 연한 포인트 면에 아이콘을 둔 자리 표시. */
export function GachaThumb({ imageUrl, size, borderRadius = radius.thumb }: Props) {
  const { colors } = useTheme();
  const box =
    size != null
      ? { width: size, height: size }
      : { width: "100%" as const, height: "100%" as const };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[box, { borderRadius, backgroundColor: colors.accentSoft }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View
      style={[
        box,
        {
          borderRadius,
          backgroundColor: colors.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Ionicons
        name="gift-outline"
        size={size != null ? Math.round(size * 0.4) : 48}
        color={colors.accent}
      />
    </View>
  );
}
