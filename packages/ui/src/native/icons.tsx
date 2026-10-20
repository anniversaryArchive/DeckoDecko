import { View } from "react-native";

import { useTheme } from "../theme";
import { radius, type ThemeColors } from "../tokens";

/**
 * 선으로 그린 작은 아이콘. 아이콘 라이브러리 없이 View 로 그린다.
 * size 는 아이콘이 차지하는 정사각형 한 변, 선 두께는 크기에 맞춰 정해진다.
 */
export type LineIconProps = {
  /** 한 변(px). 생략하면 16 */
  size?: number;
  /** 색 역할. 생략하면 textMuted */
  color?: keyof ThemeColors;
};

/** 선 두께: 시안의 24 칸 아이콘 선 두께(2.2)를 크기에 맞춰 줄인 값 */
function thickness(size: number) {
  return Math.max(1.5, Math.round(size * 0.12 * 2) / 2);
}

/** 닫기 · 지우기 × */
export function CloseIcon({ size = 16, color = "textMuted" }: LineIconProps) {
  const { colors } = useTheme();
  const t = thickness(size);
  const line = {
    position: "absolute",
    // 대각선이 정사각형 안에 들어가도록 한 변의 √2 배보다 조금 짧게
    width: size * 1.2,
    height: t,
    borderRadius: radius.full,
    backgroundColor: colors[color],
  } as const;
  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[line, { transform: [{ rotate: "45deg" }] }]} />
      <View style={[line, { transform: [{ rotate: "-45deg" }] }]} />
    </View>
  );
}

/** 아래 화살표 ⌄ (펼치기 · 고르기) */
export function ChevronDownIcon({ size = 16, color = "textMuted" }: LineIconProps) {
  const { colors } = useTheme();
  const t = thickness(size);
  // 꺾인 선 두 개 = 정사각형의 오른쪽 · 아래 테두리를 45° 돌린 것
  const arm = size * 0.5;
  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={{
          width: arm,
          height: arm,
          // 돌린 뒤 무게중심이 가운데로 오도록 조금 올린다
          marginTop: -arm * 0.35,
          borderRightWidth: t,
          borderBottomWidth: t,
          borderColor: colors[color],
          borderBottomRightRadius: t / 2,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}
