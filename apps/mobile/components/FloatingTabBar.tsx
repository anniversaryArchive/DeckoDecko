import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Platform, Pressable, View } from "react-native";

import { border, radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";

/** 탭 하나의 높이 (활성 알약 · 비활성 아이콘 공통) */
const TAB_HEIGHT = 40;
/** 비활성 탭(아이콘만)의 폭 */
const ICON_TAB_WIDTH = 44;
/** 탭 아이콘 크기. 활성 탭은 라벨이 옆에 붙어 조금 작게 */
const ACTIVE_ICON_SIZE = 20;
const INACTIVE_ICON_SIZE = 22;

/**
 * 떠 있는 알약형 하단 탭바. Tabs 의 tabBar 로 넘긴다.
 * 활성 탭은 연한 포인트 알약 안에 아이콘 + 라벨, 비활성은 아이콘만 (라벨은 accessibilityLabel 로).
 * 화면 아래에 자리를 차지하는 일반 레이아웃이라 콘텐츠가 탭바 뒤로 가려지지 않는다.
 */
export function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors } = useTheme();
  const keyboardVisible = useKeyboardVisible();
  // Android 는 키보드가 뜨면 화면이 줄어들어 탭바가 키보드 위로 올라온다 (기본 탭바의 tabBarHideOnKeyboard 와 같은 처리).
  if (Platform.OS === "android" && keyboardVisible) return null;
  return (
    <View
      style={{
        backgroundColor: colors.bg,
        paddingHorizontal: space[16],
        paddingBottom: space[18] + insets.bottom,
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: space[8],
          paddingHorizontal: space[12],
          borderRadius: radius.sheet,
          borderWidth: border.default,
          borderColor: colors.line,
          backgroundColor: colors.surface,
        }}
      >
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          if (!options) return null;
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const colorRole = focused ? "accent" : "textMuted";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              hitSlop={{ top: space[4], bottom: space[4] }}
              style={
                focused
                  ? {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: space[6],
                      height: TAB_HEIGHT,
                      paddingHorizontal: space[16],
                      borderRadius: radius.full,
                      backgroundColor: colors.accentSoft,
                    }
                  : {
                      width: ICON_TAB_WIDTH,
                      height: TAB_HEIGHT,
                      alignItems: "center",
                      justifyContent: "center",
                    }
              }
            >
              {options.tabBarIcon?.({
                focused,
                color: colors[colorRole],
                size: focused ? ACTIVE_ICON_SIZE : INACTIVE_ICON_SIZE,
              })}
              {/* 줄 높이는 caption 토큰(18)이 정해 주므로 Noto Sans KR 의 아래가 잘리지 않는다. */}
              {focused && (
                <Text variant="caption" weight="bold" color={colorRole}>
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
