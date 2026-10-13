import { colors, space } from "@deckodecko/ui";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

/** 가챠 상세. 탭 밖의 스택 화면이라 뒤로가기 헤더가 붙는다. */
export default function GachaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>가챠 상세</Text>
      <Text style={styles.muted}>id: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, gap: space.sm },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
});
