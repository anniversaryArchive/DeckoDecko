import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { border, radius, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY } from "@deckodecko/ui/native";

/** 화면 위쪽 원형 버튼 지름 (홈 검색, 상세 뒤로) */
const SIZE = 44;
/** 버튼 안 아이콘 */
const ICON_SIZE = 20;

type Props = {
  icon: ComponentProps<typeof Ionicons>["name"];
  /** 화면 읽기 프로그램이 읽을 이름 */
  label: string;
  onPress: () => void;
  /** outline: 바탕 위 흰 면 + 테두리 (홈), surface: 사진 위 흰 면 (상세) */
  variant: "outline" | "surface";
  /** 배치용 (위치) */
  style?: StyleProp<ViewStyle>;
};

/** 화면 위쪽에 두는 원형 아이콘 버튼. */
export function HeaderIconButton({ icon, label, onPress, variant, style }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          width: SIZE,
          height: SIZE,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
          opacity: pressed ? PRESSED_OPACITY : 1,
        },
        variant === "outline" && { borderWidth: border.default, borderColor: colors.line },
        style,
      ]}
    >
      <Ionicons name={icon} size={ICON_SIZE} color={colors.text} />
    </Pressable>
  );
}
