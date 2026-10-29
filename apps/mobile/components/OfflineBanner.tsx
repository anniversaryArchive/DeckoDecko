import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, Platform, View } from "react-native";
import { SafeAreaInsetsContext, useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsOnline } from "@deckodecko/core/react";
import { space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

/**
 * 오프라인이면 상태 표시줄 아래에 "오프라인 상태예요" 한 줄을 끼우고 children 을 그만큼 아래로 민다.
 * 배너가 위쪽 safe area 를 차지하므로, children 의 useSafeAreaInsets() 는 top 을 0 으로 받는다.
 * 배너는 테마와 반대 밝기(inverse)라 상태 표시줄 글자색은 루트의 StatusBar 가 온라인 여부를 보고 뒤집는다.
 */
export function OfflineBanner({ children }: { children: ReactNode }) {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  // 오프라인일 때 매번 새 객체를 넘기면 insets 를 쓰는 화면이 모두 다시 렌더된다
  const childInsets = useMemo(() => (online ? insets : { ...insets, top: 0 }), [online, insets]);
  const message = t("common.offline");
  // accessibilityLiveRegion 은 Android 만 읽어 줘서 iOS 는 VoiceOver 에 직접 알린다
  useEffect(() => {
    if (!online && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
  }, [online, message]);
  // 온라인 · 오프라인에서 트리 모양을 같게 둔다. 바뀌면 children(내비게이션 스택)이 새로 마운트돼 화면 기록이 사라진다.
  return (
    <View style={{ flex: 1 }}>
      {!online && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{
            backgroundColor: colors.inverse,
            paddingTop: insets.top + space[6],
            paddingBottom: space[6],
            paddingHorizontal: space[16],
            alignItems: "center",
          }}
        >
          <Text variant="label" color="onInverse">
            {message}
          </Text>
        </View>
      )}
      <SafeAreaInsetsContext.Provider value={childInsets}>
        {/* children 안의 absolute 요소(토스트 등)가 배너가 아니라 배너 아래 영역을 기준으로 자리 잡게 감싼다 */}
        <View style={{ flex: 1 }}>{children}</View>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}
