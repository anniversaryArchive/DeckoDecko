import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 가챠 상세. 탭 밖의 스택 화면이라 뒤로가기 헤더가 붙는다. */
export default function GachaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title="가챠 상세" description={`id: ${id}`} />;
}
