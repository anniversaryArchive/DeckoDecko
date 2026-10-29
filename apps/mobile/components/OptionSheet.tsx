import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { border, space, useTheme } from "@deckodecko/ui";
import { BottomSheet, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

/** 한 줄 높이 (손가락으로 누르기 충분한 크기) */
const ROW_HEIGHT = 48;
/** 고른 줄 오른쪽 체크 표시 */
const CHECK_SIZE = 20;

export type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  open: boolean;
  /** 사용자가 고르지 않고 닫았을 때 */
  onClose: () => void;
  title: string;
  options: readonly Option<T>[];
  value: T;
  /** 고르면 부른다. 시트는 쓰는 쪽이 open 을 false 로 바꿔 닫는다 */
  onSelect: (value: T) => void;
};

/** 바텀 시트 안의 하나 고르기 목록 (검색 결과의 정렬 · 가격). 고른 줄에 체크를 단다. */
export function OptionSheet<T extends string>({
  open,
  onClose,
  title,
  options,
  value,
  onSelect,
}: Props<T>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <BottomSheet open={open} onClose={onClose} title={title} closeLabel={t("common.close")}>
      <View accessibilityRole="radiogroup" accessibilityLabel={title}>
        {options.map((option, i) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => ({
                minHeight: ROW_HEIGHT,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: space[8],
                borderTopWidth: i === 0 ? 0 : border.divider,
                borderTopColor: colors.lineSoft,
                opacity: pressed ? PRESSED_OPACITY : 1,
              })}
            >
              <Text
                variant="body"
                weight={selected ? "bold" : "regular"}
                color={selected ? "accent" : "text"}
                style={{ flex: 1 }}
              >
                {option.label}
              </Text>
              {selected && <Ionicons name="checkmark" size={CHECK_SIZE} color={colors.accent} />}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
