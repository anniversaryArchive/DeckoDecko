import { Pressable, View } from "react-native";

import type { Gacha } from "@deckodecko/core";
import { border, space, useTheme } from "@deckodecko/ui";
import { Card, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { joinDot, joinLabel, useGachaDisplay } from "@/hooks/useGachaDisplay";
import { openGacha } from "@/lib/routes";

import { GachaThumb } from "./GachaThumb";

/** 순위 숫자 칸의 폭 (두 자리까지 줄이 맞도록) */
const RANK_WIDTH = 20;
/** 썸네일 한 변 */
const THUMB_SIZE = 44;

/** 순위 목록 (홈 "지금 인기", 검색 "인기 검색 굿즈"). 한 장의 카드 안에 줄을 쌓고 줄 사이만 구분선. */
export function RankedGachaList({ gachas }: { gachas: Gacha[] }) {
  return (
    <Card style={{ paddingHorizontal: space[14], paddingVertical: space[6] }}>
      {gachas.map((gacha, index) => (
        <RankedRow
          key={gacha.id}
          gacha={gacha}
          rank={index + 1}
          divider={index < gachas.length - 1}
        />
      ))}
    </Card>
  );
}

function RankedRow({ gacha, rank, divider }: { gacha: Gacha; rank: number; divider: boolean }) {
  const { colors } = useTheme();
  const { name, media, price } = useGachaDisplay(gacha);
  const meta = joinDot([media, price]);

  return (
    <Pressable
      onPress={() => openGacha(gacha.id)}
      accessibilityRole="button"
      accessibilityLabel={joinLabel([String(rank), name, media, price])}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space[12],
        paddingVertical: space[10],
        borderBottomWidth: divider ? border.divider : 0,
        borderBottomColor: colors.lineSoft,
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      <Text variant="bodyStrong" color="accent" style={{ width: RANK_WIDTH }}>
        {rank}
      </Text>
      <GachaThumb imageUrl={gacha.imageUrl} size={THUMB_SIZE} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        {meta !== "" && (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {meta}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
