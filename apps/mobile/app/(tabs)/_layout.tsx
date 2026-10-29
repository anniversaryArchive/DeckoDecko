import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Platform, View } from "react-native";

import { space, useTheme } from "@deckodecko/ui";
import { TabBar } from "@deckodecko/ui/native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type TabBarRenderProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/** 탭마다 아이콘 (선택 · 선택 안 됨). 키는 app/(tabs) 의 파일 이름 */
const TAB_ICONS: Record<string, { on: IconName; off: IconName }> = {
  index: { on: "home", off: "home-outline" },
  goods: { on: "folder", off: "folder-outline" },
  search: { on: "search", off: "search" },
};

/** 하단 탭 3개: 홈 · 내 굿즈 · 검색. 헤더는 숨기고 각 화면이 상단 영역과 safe area 를 직접 그린다. */
export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: t("home.title") }} />
      <Tabs.Screen name="goods" options={{ title: t("goods.title") }} />
      <Tabs.Screen name="search" options={{ title: t("search.title") }} />
    </Tabs>
  );
}

/**
 * 공용 TabBar 를 탭 내비게이션에 잇는다 (시안 B_Home 의 떠 있는 알약형).
 * 화면 위에 겹치지 않고 화면 아래에 자리를 차지하므로, 탭 화면은 아래 여백을 따로 두지 않는다.
 */
function AppTabBar({ state, descriptors, navigation, insets }: TabBarRenderProps) {
  const { colors } = useTheme();
  const keyboardVisible = useKeyboardVisible();
  // Android 는 키보드가 화면을 줄여 바가 키보드 바로 위로 올라오므로 숨긴다 (iOS 는 키보드가 바를 덮는다)
  if (keyboardVisible) return null;

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
          const icons = TAB_ICONS[route.name];
          return {
            key: route.key,
            label: descriptors[route.key]?.options.title ?? route.name,
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

/** Android 에서 키보드가 떠 있는지. iOS 는 늘 false */
function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}
