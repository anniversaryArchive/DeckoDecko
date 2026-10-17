import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";

import { useTheme } from "@deckodecko/ui";

import { FloatingTabBar } from "@/components/FloatingTabBar";

/**
 * 하단 탭 3개: 홈 · 내 굿즈 · 검색. 헤더는 없고 각 화면이 상단 영역과 safe area 를 직접 그린다.
 * 탭 라벨은 FloatingTabBar 가 Text 로 그리므로 headerTitleStyle · tabBarLabelStyle 같은 글꼴 옵션은 두지 않는다.
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.title"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="goods"
        options={{
          title: t("goods.title"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "folder" : "folder-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("search.title"),
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
