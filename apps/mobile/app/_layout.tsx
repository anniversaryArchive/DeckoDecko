// 굵기별 경로로 import 한다. 패키지 루트에서 import 하면 안 쓰는 굵기까지 전부 앱에 들어간다 (63MB).
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { NotoSansJP_400Regular } from "@expo-google-fonts/noto-sans-jp/400Regular";
import { NotoSansJP_500Medium } from "@expo-google-fonts/noto-sans-jp/500Medium";
import { NotoSansJP_700Bold } from "@expo-google-fonts/noto-sans-jp/700Bold";
import { NotoSansKR_400Regular } from "@expo-google-fonts/noto-sans-kr/400Regular";
import { NotoSansKR_500Medium } from "@expo-google-fonts/noto-sans-kr/500Medium";
import { NotoSansKR_700Bold } from "@expo-google-fonts/noto-sans-kr/700Bold";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { useLocales } from "expo-localization";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { CoreProvider } from "@deckodecko/core/react";
import { fonts, ThemeProvider, useTheme } from "@deckodecko/ui";

import { useLocalDbMigrations } from "@/lib/db/useLocalDbMigrations";
import { i18n, pickLanguage } from "@/lib/i18n";
import { repositories } from "@/lib/repositories";

// 글꼴을 다 불러올 때까지 스플래시를 유지한다. 모듈이 읽히자마자 호출해야 첫 프레임 전에 걸린다.
void SplashScreen.preventAutoHideAsync();

/**
 * 루트 레이아웃. 탭 그룹 하나와 가챠 상세 스택 하나로 시작한다.
 * 문구는 i18next(lib/i18n, import 하는 순간 기기 언어로 초기화)가, 데이터는 CoreProvider(React Query + 저장소)가 제공한다.
 * TODO(여경): app.json 에 icon · splash 설정과 assets/ 이미지 추가. 지금은 Expo 기본 아이콘으로 빌드된다.
 */
export default function RootLayout() {
  useLocalDbMigrations();

  // 키 이름이 곧 fontFamily 이름이다. @deckodecko/ui 의 fonts.sans · fonts.ja · fonts.latin 과 같아야 한다.
  const [loaded, error] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });
  // 실패해도 앱은 띄운다. 등록되지 않은 글꼴은 시스템 글꼴로 보인다.
  const ready = loaded || error !== null;

  // 앱을 쓰는 중에 기기 언어를 바꾸면 따라간다 (Android 는 앱을 다시 띄우지 않고 바뀔 수 있다)
  const locales = useLocales();
  useEffect(() => {
    const next = pickLanguage(locales);
    if (i18n.language !== next) void i18n.changeLanguage(next);
  }, [locales]);

  useEffect(() => {
    if (error) console.warn("글꼴을 불러오지 못해 시스템 글꼴로 표시합니다.", error);
    if (ready) void SplashScreen.hideAsync();
  }, [ready, error]);

  if (!ready) return null;

  // 바텀 시트(@deckodecko/ui/native 의 BottomSheet)는 제스처 루트와 시트 Provider 안에서만 열린다.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        {/* 시트 안에서도 데이터 훅을 쓸 수 있게 CoreProvider 를 시트 Provider 바깥에 둔다 */}
        <CoreProvider repositories={repositories}>
          <BottomSheetModalProvider>
            <RootStack />
          </BottomSheetModalProvider>
        </CoreProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
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
        <Stack.Screen name="gacha/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="dev/components" options={{ title: "컴포넌트 카탈로그" }} />
      </Stack>
    </>
  );
}
