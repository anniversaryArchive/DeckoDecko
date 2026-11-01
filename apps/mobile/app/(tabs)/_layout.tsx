import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";

import { space, useTheme } from "@deckodecko/ui";
import { TabBar } from "@deckodecko/ui/native";

import { isTabRoute, TAB_ICONS, type TabRoute } from "@/lib/tabIcons";

type TabBarRenderProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/** 하단 탭 3개: 홈 · 내 굿즈 · 검색. 헤더는 숨기고 각 화면이 상단 영역과 safe area 를 직접 그린다. */
export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name={"index" satisfies TabRoute} options={{ title: t("home.title") }} />
      <Tabs.Screen name={"goods" satisfies TabRoute} options={{ title: t("goods.title") }} />
      <Tabs.Screen name={"search" satisfies TabRoute} options={{ title: t("search.title") }} />
    </Tabs>
  );
}

/**
 * 공용 TabBar 를 탭 내비게이션에 잇는다 (시안 B_Home 의 떠 있는 알약형).
 * 화면 위에 겹치지 않고 화면 아래에 자리를 차지하므로, 탭 화면은 아래 여백을 따로 두지 않는다.
 * 탭 옵션은 title 만 읽는다. href: null(숨김 탭) · tabBarBadge 같은 옵션은 쓰려면 여기서 따로 읽어야 한다.
 * 키보드가 떠도 숨기지 않는다. iOS · Android(edge-to-edge) 모두 창이 줄지 않고 키보드가 바를 덮는다.
 */
function AppTabBar({ state, descriptors, navigation, insets }: TabBarRenderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const count = state.routes.length;

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        paddingHorizontal: space[16],
        paddingBottom: Math.max(insets.bottom, space[18]),
      }}
    >
      <TabBar
        items={state.routes.map((route, index) => {
          const selected = state.index === index;
          const icons = isTabRoute(route.name) ? TAB_ICONS[route.name] : undefined;
          const label = descriptors[route.key]?.options.title ?? route.name;
          return {
            key: route.key,
            label,
            // iOS 는 role 이 button 이라(TabBar) 탭이라는 것과 위치를 이름에 넣는다. 기본 탭 바와 같다
            accessibilityLabel:
              Platform.OS === "ios"
                ? t("common.tabA11yLabel", { name: label, index: index + 1, count })
                : undefined,
            selected,
            renderIcon: ({ color, size, selected: iconSelected }) =>
              icons ? (
                <Ionicons name={iconSelected ? icons.on : icons.off} color={color} size={size} />
              ) : null,
            // 기본 탭 바와 같은 순서: 이벤트를 먼저 보내고(같은 탭이면 useScrollToTop 을 건 목록이 맨 위로 간다), 막지 않았으면 이동한다
            onPress: () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!selected && !event.defaultPrevented)
                navigation.navigate(route.name, route.params);
            },
            onLongPress: () => navigation.emit({ type: "tabLongPress", target: route.key }),
          };
        })}
      />
    </View>
  );
}
