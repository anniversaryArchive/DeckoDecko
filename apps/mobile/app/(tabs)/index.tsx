import { Link } from "expo-router";
import { View } from "react-native";

import { space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 홈. 소장률 카드 · 신상 · 인기 · 공지 띠는 목 데이터로 채운다. */
export default function HomeScreen() {
  return (
    <PlaceholderScreen title="홈" description="소장률 · 새로 나왔어요 · 지금 인기 · 공지">
      {/* 글꼴 확인용: 한글은 Noto Sans KR, 숫자는 Inter. 실제 소장률 카드가 생기면 지운다. */}
      <View style={{ marginTop: space[16], gap: space[4] }}>
        <Text variant="label" color="textMuted">
          내 굿즈 소장률
        </Text>
        <Text variant="displayLg" numeric color="accent">
          64%
        </Text>
      </View>
      <Link href="/gacha/sample" asChild>
        <Text variant="bodyStrong" color="accent" style={{ marginTop: space[16] }}>
          가챠 상세로 이동 (라우팅 확인용)
        </Text>
      </Link>
    </PlaceholderScreen>
  );
}
