import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

import { useGacha } from "@deckodecko/core/react";
import { useTheme } from "@deckodecko/ui";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 가챠 상세. 탭 밖의 스택 화면이라 뒤로가기 헤더가 붙는다. 레이아웃은 #107 에서 채운다. */
export default function GachaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: gacha, isPending } = useGacha(id);

  if (isPending) {
    return <PlaceholderScreen title="가챠 상세" description="불러오는 중…" />;
  }
  if (!gacha) {
    return <PlaceholderScreen title="가챠 상세" description={`없는 가챠예요 (id: ${id})`} />;
  }
  return (
    <PlaceholderScreen
      title={gacha.nameKo ?? gacha.name}
      description={[
        gacha.name,
        gacha.media?.title,
        gacha.releaseMonth,
        gacha.price != null ? `${gacha.price}엔` : null,
      ]
        .filter(Boolean)
        .join(" · ")}
    >
      {gacha.items.map((item) => (
        <Text key={item.id} style={{ color: colors.text }}>
          {item.number}. {item.nameKo ?? item.name}
        </Text>
      ))}
    </PlaceholderScreen>
  );
}
