import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { CoreProvider } from "@deckodecko/core/react";
import { ThemeProvider, useTheme } from "@deckodecko/ui";

import { repositories } from "@/lib/repositories";

/**
 * 루트 레이아웃. 탭 그룹 하나와 가챠 상세 스택 하나로 시작한다.
 * 글꼴 로드, i18n Provider 는 다음 작업에서 여기에 붙는다. 데이터는 CoreProvider(React Query + 저장소)가 제공한다.
 * TODO(여경): app.json 에 icon · splash 설정과 assets/ 이미지 추가. 지금은 Expo 기본 아이콘으로 빌드된다.
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <CoreProvider repositories={repositories}>
        <RootStack />
      </CoreProvider>
    </ThemeProvider>
  );
}

function RootStack() {
  const { scheme, colors } = useTheme();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gacha/[id]" options={{ title: "가챠 상세" }} />
      </Stack>
    </>
  );
}
