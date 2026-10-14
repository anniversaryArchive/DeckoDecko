// 굵기별 경로로 import 한다. 패키지 루트에서 import 하면 안 쓰는 굵기까지 전부 앱에 들어간다 (63MB).
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { NotoSansKR_400Regular } from "@expo-google-fonts/noto-sans-kr/400Regular";
import { NotoSansKR_500Medium } from "@expo-google-fonts/noto-sans-kr/500Medium";
import { NotoSansKR_700Bold } from "@expo-google-fonts/noto-sans-kr/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { fonts, ThemeProvider, useTheme } from "@deckodecko/ui";

// 글꼴을 다 불러올 때까지 스플래시를 유지한다. 모듈이 읽히자마자 호출해야 첫 프레임 전에 걸린다.
void SplashScreen.preventAutoHideAsync();

/**
 * 루트 레이아웃. 탭 그룹 하나와 가챠 상세 스택 하나로 시작한다.
 * i18n Provider, React Query Provider 는 다음 작업에서 여기에 붙는다.
 * TODO(여경): app.json 에 icon · splash 설정과 assets/ 이미지 추가. 지금은 Expo 기본 아이콘으로 빌드된다.
 */
export default function RootLayout() {
  // 키 이름이 곧 fontFamily 이름이다. @deckodecko/ui 의 fonts.sans · fonts.latin 과 같아야 한다.
  const [loaded, error] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });
  // 실패해도 앱은 띄운다. 등록되지 않은 글꼴은 시스템 글꼴로 보인다.
  const ready = loaded || error !== null;

  useEffect(() => {
    if (error) console.warn("글꼴을 불러오지 못해 시스템 글꼴로 표시합니다.", error);
    if (ready) void SplashScreen.hideAsync();
  }, [ready, error]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <RootStack />
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
          headerTitleStyle: { fontFamily: fonts.sans.bold },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gacha/[id]" options={{ title: "가챠 상세" }} />
      </Stack>
    </>
  );
}
