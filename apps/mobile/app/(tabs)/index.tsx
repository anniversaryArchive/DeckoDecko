import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

/** 홈. 소장률 카드 · 신상 · 인기 · 공지 띠는 2주차에 목 데이터로 채운다. */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈</Text>
      <Text style={styles.muted}>소장률 · 새로 나왔어요 · 지금 인기 · 공지</Text>
      <Link href="/gacha/sample" style={styles.link}>
        가챠 상세로 이동 (라우팅 확인용)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#2B2622" },
  muted: { fontSize: 14, color: "#7A7068" },
  link: { marginTop: 16, color: "#D9573F", fontWeight: "700" },
});
