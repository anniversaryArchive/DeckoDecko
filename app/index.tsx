import "react-native-gesture-handler";
import "react-native-reanimated"; // 반드시 최상단에 위치
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="justify-center flex-1 gap-12 px-5">
      <Link href="/style-guide" asChild>
        <Pressable>
          <Text className="font-dunggeunmiso text-secondary-dark text-2xl">스타일 가이드</Text>
        </Pressable>
      </Link>

      <Link href="/(tabs)/home" asChild>
        <Pressable>
          <Text className="font-dunggeunmiso text-secondary-dark text-2xl">
            BOTTOM NAVIGATION BAR (TABS) TEST
          </Text>
        </Pressable>
      </Link>
      <Link href="/folderPicker-test" asChild>
        <Pressable>
          <Text className="font-dunggeunmiso text-secondary-dark text-2xl">
            폴더 선택 테스트 화면
          </Text>
        </Pressable>
      </Link>
      <Link href="/bookmarkSheet-test" asChild>
        <Pressable>
          <Text className="font-dunggeunmiso text-secondary-dark text-2xl">북마크 테스트 화면</Text>
        </Pressable>
      </Link>
      <Link href="/image-test" asChild>
        <Pressable>
          <Text className="font-dunggeunmiso text-secondary-dark text-2xl">이미지 테스트 화면</Text>
        </Pressable>
      </Link>
    </View>
  );
}
