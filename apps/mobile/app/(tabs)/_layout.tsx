import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

/** 하단 탭 3개: 홈 · 내 굿즈 · 검색. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D9573F",
        tabBarInactiveTintColor: "#7A7068",
        headerStyle: { backgroundColor: "#FFF9F4" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: "#FFF9F4" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="goods"
        options={{
          title: "내 굿즈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "검색",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
