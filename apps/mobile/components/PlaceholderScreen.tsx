import type { ReactNode } from "react";
import { View } from "react-native";

import { space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

type Props = {
  title: string;
  /** 이 화면에 들어올 내용을 한 줄로. */
  description: string;
  children?: ReactNode;
};

/** 아직 만들지 않은 화면의 자리. 실제 화면이 생기면 이 컴포넌트는 지운다. */
export function PlaceholderScreen({ title, description, children }: Props) {
  return (
    <View style={{ flex: 1, padding: space[24], gap: space[8] }}>
      <Text variant="headingLg">{title}</Text>
      <Text color="textMuted">{description}</Text>
      {children}
    </View>
  );
}
