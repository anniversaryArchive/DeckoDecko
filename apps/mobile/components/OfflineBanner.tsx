import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, Platform, View } from "react-native";
import { SafeAreaInsetsContext, useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsOnline } from "@deckodecko/core/react";
import { space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

/**
 * 오프라인일 때 화면 맨 위에 "오프라인 상태예요" 띠를 띄우고, 그 아래로 앱 화면(children)을 그린다.
 * 루트 레이아웃에서 앱 전체를 한 번 감싼다.
 * - 띠가 상태 표시줄 자리까지 차지하므로, 안쪽 화면은 위쪽 여백(useSafeAreaInsets().top)을 0 으로 받는다.
 * - 띠가 어두운 색이라 상태 표시줄 글자색은 _layout.tsx 의 AppStatusBar 가 바꾼다.
 */
export function OfflineBanner({ children }: { children: ReactNode }) {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  // 렌더마다 새 객체를 넘기면 여백을 쓰는 화면이 전부 다시 그려져서 한 번만 만든다
  const childInsets = useMemo(() => (online ? insets : { ...insets, top: 0 }), [online, insets]);
  const message = t("common.offline");
  // accessibilityLiveRegion 은 Android 만 읽어 줘서 iOS 는 VoiceOver 에 직접 알린다
  useEffect(() => {
    if (!online && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
  }, [online, message]);
  // 띠가 생기고 사라져도 구조를 같게 둔다. 구조가 바뀌면 화면이 처음부터 다시 만들어져 보던 화면 기록이 사라진다
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
        {/* 토스트처럼 화면 위에 띄우는 요소가 띠를 가리지 않고 띠 아래에 자리 잡게 감싼다 */}
        <View style={{ flex: 1 }}>{children}</View>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}
