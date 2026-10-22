import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { fonts, typography, useTheme } from "@deckodecko/ui";

/** 하단 탭 3개: 홈 · 내 굿즈 · 검색. 헤더는 숨기고 각 화면이 상단 영역과 safe area 를 직접 그린다. */
export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        // 내비게이션이 그리는 글자는 Text 를 거치지 않으므로 글꼴을 여기서 지정한다.
        headerTitleStyle: { fontFamily: fonts.sans.bold },
        // 머리글 높이는 고정이라 시스템 글자 크기를 키우면 제목 위쪽이 잘린다. 비워 두면 크기를 따라가므로 꺼 둔다.
        headerTitleAllowFontScaling: false,
        // Noto Sans KR 은 글자 위아래 여백이 커서 줄 높이를 정해 주지 않으면 아래가 잘린다.
        tabBarLabelStyle: {
          fontFamily: fonts.sans.bold,
          fontSize: typography.captionXs.fontSize,
          lineHeight: typography.captionXs.lineHeight,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="goods"
        options={{
          title: t("goods.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("search.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
