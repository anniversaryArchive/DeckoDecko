import { Link } from "expo-router";

import { space, useTheme } from "@deckodecko/ui";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 홈. 소장률 카드 · 신상 · 인기 · 공지 띠는 목 데이터로 채운다. */
export default function HomeScreen() {
  const { colors } = useTheme();
  return (
    <PlaceholderScreen title="홈" description="소장률 · 새로 나왔어요 · 지금 인기 · 공지">
      <Link
        href="/gacha/sample"
        style={{ marginTop: space.lg, color: colors.accent, fontWeight: "700" }}
      >
        가챠 상세로 이동 (라우팅 확인용)
      </Link>
    </PlaceholderScreen>
  );
}
