import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * 루트 레이아웃. 탭 그룹 하나와 가챠 상세 스택 하나로 시작한다.
 * 글꼴 로드, i18n Provider, React Query Provider 는 다음 작업에서 여기에 붙는다.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerTintColor: "#2B2622", contentStyle: { backgroundColor: "#FFF9F4" } }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gacha/[id]" options={{ title: "가챠 상세" }} />
      </Stack>
    </>
  );
}
