import { StyleSheet, Text, View } from "react-native";

/** 내 굿즈. WISH / GET 목록, 폴더 필터, 묶어보기는 3주차. */
export default function GoodsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 굿즈</Text>
      <Text style={styles.muted}>아직 저장된 가챠가 없어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#2B2622" },
  muted: { fontSize: 14, color: "#7A7068" },
});
