import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { radius, space, type ThemeColors } from "../tokens";
import { Text } from "./Text";

/** 항목 하나의 높이. 바깥은 위아래 안쪽 여백(4)만큼 더 크다 */
const ITEM_HEIGHT = 40;

/**
 * 선택된 항목의 면.
 * primary: 기본 (아이템 추가 시트의 WISH)
 * wish · get: WISH / GET 을 고르는 곳에서 각 색으로 (내 굿즈, 아이템 수정 시트)
 */
export type SegmentTone = "primary" | "wish" | "get";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  tone?: SegmentTone;
};

export type SegmentProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 화면 읽기 프로그램이 읽을 이름 ("상태" 등) */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

function toneColors(tone: SegmentTone, colors: ThemeColors) {
  switch (tone) {
    case "primary":
      return { bg: colors.primary, text: "onPrimary" } as const;
    case "wish":
      return { bg: colors.wishSurface, text: "onWish" } as const;
    case "get":
      return { bg: colors.getSurface, text: "onGet" } as const;
  }
}

/** 둘 이상 중 하나를 고르는 둥근 탭 (WISH / GET, 문의 종류). */
export function Segment<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: "row",
          padding: space[4],
          borderRadius: radius.full,
          backgroundColor: colors.bg,
        },
        style,
      ]}
    >
      {options.map((o) => {
        const selected = o.value === value;
        const c = toneColors(o.tone ?? "primary", colors);
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              height: ITEM_HEIGHT,
              borderRadius: radius.full,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: space[8],
              backgroundColor: selected ? c.bg : "transparent",
            }}
          >
            <Text
              variant="label"
              weight={selected ? "bold" : "medium"}
              color={selected ? c.text : "textMuted"}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
