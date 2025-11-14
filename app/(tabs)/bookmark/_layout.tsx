import { Stack } from "expo-router";

export default function BookmarkStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "white" } }} />
  );
}
