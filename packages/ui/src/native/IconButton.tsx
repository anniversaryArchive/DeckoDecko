import type { ReactNode } from "react";
import { Pressable } from "react-native";

import { useTheme } from "../theme";
import { radius, space } from "../tokens";
import { PRESSED_OPACITY } from "./pressable";

export type IconButtonProps = {
  /** 버튼 지름 */
  size: number;
  /** 화면 읽기 프로그램이 읽을 이름 ("닫기", "지우기"). 컴포넌트 안에 문구를 두지 않으므로 쓰는 쪽에서 넘긴다 */
  label?: string;
  onPress: () => void;
  /** 가운데 아이콘 */
  children: ReactNode;
};

/**
 * 아이콘 하나를 담은 둥근 버튼. 시트 닫기 · 입력창 지우기처럼 작은 보조 버튼에 쓴다.
 * 패키지 안에서만 쓴다 (아직 화면에서 직접 쓸 곳이 없다).
 */
export function IconButton({ size, label, onPress, children }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={space[4]}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      {children}
    </Pressable>
  );
}
