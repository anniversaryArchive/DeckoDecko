import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** 하단 탭 라우트 (app/(tabs) 의 파일 이름) */
export type TabRoute = "index" | "goods" | "search";

/** 탭마다 아이콘 (선택 · 선택 안 됨). 앱의 하단 탭과 개발용 컴포넌트 견본이 같이 쓴다 */
export const TAB_ICONS: Record<TabRoute, { on: IconName; off: IconName }> = {
  index: { on: "home", off: "home-outline" },
  goods: { on: "folder", off: "folder-outline" },
  search: { on: "search", off: "search" },
};

export function isTabRoute(name: string): name is TabRoute {
  return Object.keys(TAB_ICONS).includes(name);
}
