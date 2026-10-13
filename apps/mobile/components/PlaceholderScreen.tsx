import { Text, View } from "react-native";

import { space, useTheme } from "@deckodecko/ui";

import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 이 화면에 들어올 내용을 한 줄로. */
  description: string;
  children?: ReactNode;
};

/** 아직 만들지 않은 화면의 자리. 실제 화면이 생기면 이 컴포넌트는 지운다. */
export function PlaceholderScreen({ title, description, children }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, padding: space.xl, gap: space.sm }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted }}>{description}</Text>
      {children}
    </View>
  );
}
