import { colors, space } from "@deckodecko/ui";
import { StyleSheet, Text, View } from "react-native";

/** 내 굿즈. WISH / GET 목록, 폴더 필터, 묶어보기가 여기에 온다. */
export default function GoodsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 굿즈</Text>
      <Text style={styles.muted}>아직 저장된 가챠가 없어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, gap: space.sm },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
});
