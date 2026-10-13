import { StyleSheet, Text, View } from "react-native";

import { colors, space } from "@deckodecko/ui";

import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 이 화면에 들어올 내용을 한 줄로. */
  description: string;
  children?: ReactNode;
};

/** 아직 만들지 않은 화면의 자리. 실제 화면이 생기면 이 컴포넌트는 지운다. */
export function PlaceholderScreen({ title, description, children }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{description}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, gap: space.sm },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
});
