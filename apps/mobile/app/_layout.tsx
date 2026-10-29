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
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { CoreProvider, useIsOnline } from "@deckodecko/core/react";
import { fonts, ThemeProvider, useTheme } from "@deckodecko/ui";
import { ToastProvider } from "@deckodecko/ui/native";

import { OfflineBanner } from "@/components/OfflineBanner";
import { StateMessage } from "@/components/StateMessage";
import { useLocalDbMigrations } from "@/lib/db/useLocalDbMigrations";
import { followDeviceLanguage } from "@/lib/i18n";
import { watchNetworkState } from "@/lib/network";
import { repositories } from "@/lib/repositories";

// 글꼴과 로컬 DB 마이그레이션이 끝날 때까지 스플래시를 유지한다. 모듈이 읽히자마자 호출해야 첫 프레임 전에 걸린다.
void SplashScreen.preventAutoHideAsync();
// 첫 쿼리보다 먼저 연결 상태를 듣기 시작한다
watchNetworkState();

/**
 * 루트 레이아웃. 탭 그룹 하나와 가챠 상세 스택 하나로 시작한다.
 * 문구는 i18next(lib/i18n, import 하는 순간 설정에서 고른 언어 · 없으면 기기 언어로 초기화)가, 데이터는 CoreProvider(React Query + 저장소)가 제공한다.
 */
export default function RootLayout() {
  const localDb = useLocalDbMigrations();
  // 실패하면 스플래시를 내리고 앱 대신 실패 화면을 띄운다 (LocalDbFailed)
  const localDbDone = localDb.success || localDb.error !== undefined;
  const { t } = useTranslation();

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
  const ready = (loaded || error !== null) && localDbDone;

  // 앱을 쓰는 중에 기기 언어를 바꾸면 따라간다 (Android 는 앱을 다시 띄우지 않고 바뀔 수 있다)
  const locales = useLocales();
  useEffect(() => followDeviceLanguage(locales), [locales]);

  useEffect(() => {
    if (error) console.warn("글꼴을 불러오지 못해 시스템 글꼴로 표시합니다.", error);
    if (ready) void SplashScreen.hideAsync();
  }, [ready, error]);

  if (!ready) return null;

  // 바텀 시트(@deckodecko/ui/native 의 BottomSheet)는 제스처 루트와 시트 Provider 안에서만 열린다.
  // 토스트(useToast)는 머리글 · 시트 위에 겹치도록 둘을 감싼 ToastProvider 가 그린다.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        {localDb.success ? (
          // 시트 안에서도 데이터 훅을 쓸 수 있게 CoreProvider 를 시트 Provider 바깥에 둔다
          <CoreProvider repositories={repositories}>
            {/* 토스트가 배너를 가리지 않게 배너를 토스트 바깥에 둔다 (토스트는 배너 아래부터 자리를 잡는다) */}
            <OfflineBanner>
              <ToastProvider closeLabel={t("common.close")} closeHint={t("common.closeToastHint")}>
                <BottomSheetModalProvider>
                  <RootStack />
                </BottomSheetModalProvider>
              </ToastProvider>
            </OfflineBanner>
          </CoreProvider>
        ) : (
          <LocalDbFailed retrying={localDb.retrying} onRetry={localDb.retry} />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/** 로컬 DB 를 준비하지 못했을 때 앱 대신 보이는 화면. 기록을 저장할 수 없으므로 탐색 화면도 띄우지 않는다. */
function LocalDbFailed({ retrying, onRetry }: { retrying: boolean; onRetry: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StateMessage
        fill
        message={t("startup.localDbFailed")}
        loading={retrying}
        onRetry={retrying ? undefined : onRetry}
      />
    </View>
  );
}

// StatusBar 는 앱에 이것 하나만 둔다 (둘이면 마운트 순서로 승부가 갈린다). 오프라인이면 뒤가 배너(inverse)라 글자색을 뒤집는다
function AppStatusBar() {
  const { scheme } = useTheme();
  const online = useIsOnline();
  const darkBehind = (scheme === "dark") === online;
  return <StatusBar style={darkBehind ? "light" : "dark"} />;
}

function RootStack() {
  const { colors } = useTheme();
  return (
    <>
      <AppStatusBar />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.sans.bold },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gacha/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="dev/components" options={{ title: "컴포넌트 카탈로그" }} />
      </Stack>
    </>
  );
}
