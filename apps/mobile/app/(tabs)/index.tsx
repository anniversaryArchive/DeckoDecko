import { Link } from "expo-router";
import { Text } from "react-native";

import { useGachaList } from "@deckodecko/core/react";
import { space, useTheme } from "@deckodecko/ui";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 홈. 소장률 카드 · 신상 · 인기 · 공지 띠는 목 데이터로 채운다. 지금은 저장소 훅이 도는지 보여 주는 목록만 있다. */
export default function HomeScreen() {
  const { colors } = useTheme();
  const { data: gachaList, isPending, isError } = useGachaList();
  return (
    <PlaceholderScreen title="홈" description="소장률 · 새로 나왔어요 · 지금 인기 · 공지">
      {isPending && <Text style={{ color: colors.textMuted }}>불러오는 중…</Text>}
      {isError && <Text style={{ color: colors.accent }}>목록을 불러오지 못했어요</Text>}
      {gachaList?.map((gacha) => (
        <Link
          key={gacha.id}
          href={{ pathname: "/gacha/[id]", params: { id: gacha.id } }}
          style={{ color: colors.text }}
        >
          {gacha.nameKo ?? gacha.name}
          <Text style={{ color: colors.textMuted }}>
            {"  "}
            {gacha.media?.title ?? ""} · {gacha.itemCount ?? 0}종
          </Text>
        </Link>
      ))}
      <Link
        href="/gacha/sample"
        style={{ marginTop: space[16], color: colors.accent, fontWeight: "700" }}
      >
        없는 가챠로 이동 (없음 상태 확인용)
      </Link>
    </PlaceholderScreen>
  );
}
