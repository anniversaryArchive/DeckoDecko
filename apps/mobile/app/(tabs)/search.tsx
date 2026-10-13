import { colors, space } from "@deckodecko/ui";
import { StyleSheet, Text, View } from "react-native";

/** 검색. 최근 검색어 · 최근 본 굿즈 · 인기가 여기에 온다. */
export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>검색</Text>
      <Text style={styles.muted}>상품명 · 작품명으로 검색</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, gap: space.sm },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
});
