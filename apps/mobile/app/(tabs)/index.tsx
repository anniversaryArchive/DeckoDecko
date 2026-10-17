import { Link } from "expo-router";
import { View } from "react-native";

import { useGachaList } from "@deckodecko/core/react";
import { space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 홈. 소장률 카드 · 신상 · 인기 · 공지 띠는 목 데이터로 채운다. 지금은 저장소 훅이 도는지 보여 주는 목록만 있다. */
export default function HomeScreen() {
  const { data: gachaList, isPending, isError } = useGachaList();
  return (
    <PlaceholderScreen title="홈" description="소장률 · 새로 나왔어요 · 지금 인기 · 공지">
      {/* 글꼴 확인용: 한글은 Noto Sans KR, 숫자 · 영어 · 특수문자는 Inter. 실제 소장률 카드가 생기면 지운다. */}
      <View style={{ marginTop: space[16], gap: space[4] }}>
        <Text variant="label" color="textMuted">
          내 굿즈 소장률
        </Text>
        <Text variant="displayLg" color="accent">
          64%
        </Text>
        <Text variant="headingLg" color="textMuted">
          숲속 친구들 마스코트 Vol.2
        </Text>
      </View>
      {isPending && <Text color="textMuted">불러오는 중…</Text>}
      {isError && <Text color="accent">목록을 불러오지 못했어요</Text>}
      {gachaList?.map((gacha) => (
        <Link key={gacha.id} href={{ pathname: "/gacha/[id]", params: { id: gacha.id } }} asChild>
          <Text>
            {gacha.nameKo ?? gacha.name}
            <Text color="textMuted">
              {"  "}
              {gacha.media?.title ?? ""} · {gacha.itemCount ?? 0}종
            </Text>
          </Text>
        </Link>
      ))}
      <Link href="/gacha/sample" asChild>
        <Text variant="bodyStrong" color="accent" style={{ marginTop: space[16] }}>
          없는 가챠로 이동 (없음 상태 확인용)
        </Text>
      </Link>
    </PlaceholderScreen>
  );
}
