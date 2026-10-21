import { Pressable } from "react-native";

import type { Gacha } from "@deckodecko/core";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { joinLabel, useGachaDisplay } from "@/hooks/useGachaDisplay";
import { openGacha } from "@/lib/routes";

/**
 * 자리 크기. 시안 카드와 같은 크기라 배치(가로 스크롤 폭, 목록 간격)는 실제 카드가 들어와도 그대로다.
 * vertical: 홈 "새로 나왔어요" (폭 156, 이미지 140 + 글 세 줄)
 * horizontal: 검색 결과 (썸네일 96 + 위아래 여백 12)
 */
const SIZE = {
  vertical: { width: 156, height: 236 },
  horizontal: { height: 124 },
} as const;

type Props = {
  gacha: Gacha;
  layout: keyof typeof SIZE;
};

/**
 * 가챠 카드 자리. #139 의 공용 GoodsCard 가 들어오면 이 컴포넌트를 GoodsCard 로 바꾼다.
 * 그 전까지는 바꿔야 할 자리라는 게 보이도록 점선 네모에 이름만 둔다. 누르면 상세로 간다.
 */
export function GachaCardSlot({ gacha, layout }: Props) {
  const { colors } = useTheme();
  const { name, media } = useGachaDisplay(gacha);
  return (
    <Pressable
      onPress={() => openGacha(gacha.id)}
      accessibilityRole="button"
      accessibilityLabel={joinLabel([media, name])}
      style={({ pressed }) => [
        SIZE[layout],
        {
          alignItems: "center",
          justifyContent: "center",
          padding: space[12],
          borderRadius: radius.card,
          borderWidth: border.default,
          borderStyle: "dashed",
          borderColor: colors.line,
          opacity: pressed ? PRESSED_OPACITY : 1,
        },
      ]}
    >
      <Text variant="label" color="textMuted" numberOfLines={2} style={{ textAlign: "center" }}>
        {name}
      </Text>
    </Pressable>
  );
}
