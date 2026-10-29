import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import type { GoodsViewMode } from "@deckodecko/core";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY } from "@deckodecko/ui/native";

import { GOODS_SEARCH_HEIGHT } from "@/components/GoodsSearchField";

/** 버튼 하나의 폭 · 아이콘 */
const BUTTON_WIDTH = 36;
const ICON_SIZE = 18;
/** 바깥 테두리 안쪽 여백 */
const PADDING = space[4];
/** 바깥과 모서리 중심이 같아 보이게 안쪽 버튼은 여백만큼 덜 둥글게 */
const INNER_RADIUS = radius.thumb - PADDING;

const OPTIONS: { mode: GoodsViewMode; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { mode: "gachas", icon: "copy-outline" },
  { mode: "items", icon: "grid-outline" },
];

type Props = {
  value: GoodsViewMode;
  onChange: (mode: GoodsViewMode) => void;
};

/** 묶어보기(가챠별) · 풀어보기(아이템별) 전환. 검색창 옆에 둔다. */
export function GoodsViewToggle({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t("goods.viewModeLabel")}
      style={{
        flexDirection: "row",
        gap: space[4],
        height: GOODS_SEARCH_HEIGHT,
        padding: PADDING,
        borderRadius: radius.thumb,
        borderWidth: border.default,
        borderColor: colors.line,
        backgroundColor: colors.surface,
      }}
    >
      {OPTIONS.map(({ mode, icon }) => {
        const selected = mode === value;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t(mode === "gachas" ? "goods.viewGachas" : "goods.viewItems")}
            style={({ pressed }) => ({
              width: BUTTON_WIDTH,
              borderRadius: INNER_RADIUS,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? colors.accentSoft : undefined,
              opacity: pressed ? PRESSED_OPACITY : 1,
            })}
          >
            <Ionicons
              name={icon}
              size={ICON_SIZE}
              color={selected ? colors.accent : colors.textMuted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
