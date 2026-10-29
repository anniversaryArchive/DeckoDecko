import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { border, radius, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY } from "@deckodecko/ui/native";

/** 버튼 지름. md: 화면 위쪽 (홈 검색, 상세 뒤로), lg: 옆의 Button lg 와 높이를 맞출 때 (상세 사진 인식) */
const SIZE = { md: 44, lg: 54 } as const;
/** md 버튼 지름. 머리글 제목을 가운데에 둘 때 반대쪽 빈 자리 폭으로 쓴다 */
export const HEADER_ICON_BUTTON_SIZE = SIZE.md;
/** 버튼 안 아이콘 */
const ICON_SIZE = { md: 20, lg: 22 } as const;

type Props = {
  icon: ComponentProps<typeof Ionicons>["name"];
  /** 화면 읽기 프로그램이 읽을 이름 */
  label: string;
  onPress: () => void;
  /**
   * outline: 바탕 위 흰 면 + 테두리 (홈), surface: 사진 위 흰 면 (상세),
   * accent: 흰 면 + 포인트 테두리 · 포인트 아이콘 (상세 사진 인식), primary: 주 색 면 (폴더 관리 새 폴더)
   */
  variant: "outline" | "surface" | "accent" | "primary";
  /** 생략하면 md */
  size?: keyof typeof SIZE;
  /** 배치용 (위치) */
  style?: StyleProp<ViewStyle>;
};

/** 아이콘 하나를 담은 원형 버튼. */
export function HeaderIconButton({ icon, label, onPress, variant, size = "md", style }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          width: SIZE[size],
          height: SIZE[size],
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
          opacity: pressed ? PRESSED_OPACITY : 1,
        },
        variant === "outline" && { borderWidth: border.default, borderColor: colors.line },
        variant === "accent" && { borderWidth: border.default, borderColor: colors.primary },
        variant === "primary" && { backgroundColor: colors.primary },
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={ICON_SIZE[size]}
        color={
          variant === "accent"
            ? colors.accent
            : variant === "primary"
              ? colors.onPrimary
              : colors.text
        }
      />
    </Pressable>
  );
}
