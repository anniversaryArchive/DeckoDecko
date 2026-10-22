import { View } from "react-native";

import type { Gacha } from "@deckodecko/core";
import { space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { GachaCardSlot } from "./GachaCardSlot";

/** 순위 숫자 칸의 폭 (두 자리까지 카드 왼쪽 끝이 맞도록) */
const RANK_WIDTH = 20;

/**
 * 인기 목록 (홈 "지금 인기", 검색 "인기 검색 굿즈"). 순위 숫자 + 가로 카드.
 * 순위는 카드(#139 GoodsCard)가 아니라 이 목록이 붙인다.
 */
export function PopularGachaList({ gachas }: { gachas: Gacha[] }) {
  return (
    <View style={{ gap: space[10] }}>
      {gachas.map((gacha, index) => (
        <View key={gacha.id} style={{ flexDirection: "row", alignItems: "center", gap: space[8] }}>
          <Text variant="bodyStrong" color="accent" style={{ width: RANK_WIDTH }}>
            {index + 1}
          </Text>
          <View style={{ flex: 1 }}>
            <GachaCardSlot gacha={gacha} layout="horizontal" />
          </View>
        </View>
      ))}
    </View>
  );
}
