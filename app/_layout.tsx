import "@styles/global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { PortalProvider } from "@/PortalContext";
import folder from "@table/folders";
import items from "@table/items";
import { defaultFolderState } from "@/stores/defaultFolderState";

import type { TFolder } from "@/types/folder";

export default function RootLayout() {
  const [fontLoaded] = useFonts({
    "Dunggeunmiso": require("../assets/fonts/Hakgyoansim-Dunggeunmiso-OTF-R.otf"),
    "DunggeunmisoB": require("../assets/fonts/Hakgyoansim-Dunggeunmiso-OTF-B.otf"),
  });
  const initializeFolder = defaultFolderState((state) => state.initializeFolder);

  useEffect(() => {
    const loadFolder = async () => {
      const defaultFolder = (await folder.getFolderById(1)) as TFolder;
      initializeFolder(defaultFolder);
    };

    loadFolder();
  }, [initializeFolder]);

  useEffect(() => {
    // 모두 한번씩 실행된 후에는 삭제될 예정입니다~
    const migrationItemDB = async () => {
      const isDone = await AsyncStorage.getItem("MIGRATION_ITEM_TABLE");

      if (isDone === "false" || !!isDone) {
        const migrate = await items.migration();
        await AsyncStorage.setItem("MIGRATION_ITEM_TABLE", `${migrate}`);
        console.log(migrate);
      }
    };

    migrationItemDB();
  }, []);

  if (!fontLoaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <PortalProvider>
          <Stack screenOptions={{ contentStyle: { backgroundColor: "white" } }}>
            <Stack.Screen name="index" options={{ title: "HOME" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="detail/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="notice" options={{ headerShown: false }} />
            <Stack.Screen name="notice/[id]" options={{ headerShown: false }} />
          </Stack>
        </PortalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
