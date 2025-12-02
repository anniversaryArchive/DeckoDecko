import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "@/components/Icon";
import { colors } from "@/utils/tailwind-colors";
import type { TabPressEvent } from "@react-navigation/native"; // 타입 임포트

const TABS = [
  { name: "index", title: "홈", icon: "star" },
  { name: "bookmark", title: "내 굿즈", icon: "folder" },
  { name: "search", title: "검색", icon: "search" },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  let paddingBottom = insets.bottom;
  if (!paddingBottom) paddingBottom = 10;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarLabelStyle: { fontFamily: "DunggeunmisoB", fontSize: 12 },
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarStyle: {
          height: 60 + paddingBottom,
          paddingTop: 5,
          paddingBottom: paddingBottom,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            headerShown: false,
            title: tab.title,
            unmountOnBlur: true,
            tabBarIcon: ({ color }) => (
              <Icon name={tab.icon} size={28.0} fill={color} stroke={color} />
            ),
            tabBarIconStyle: { marginBottom: 4 },
            sceneStyle: { paddingTop: insets.top, backgroundColor: "white" },
          }}
          listeners={{
            tabPress: (e: TabPressEvent) => {
              if (tab.name === "search") {
                e.preventDefault();
                router.replace("/search");
              }
            },
          }}
        />
      ))}
    </Tabs>
  );
}
