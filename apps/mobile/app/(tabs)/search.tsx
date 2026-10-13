import { StyleSheet, Text, View } from "react-native";

/** 검색. 최근 검색어 · 최근 본 굿즈 · 인기는 2주차. */
export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>검색</Text>
      <Text style={styles.muted}>상품명 · 작품명으로 검색</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#2B2622" },
  muted: { fontSize: 14, color: "#7A7068" },
});
