import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from "react-native";

import { border, fonts, radius, space, typography, useTheme } from "@deckodecko/ui";
import { CloseIcon, PRESSED_OPACITY } from "@deckodecko/ui/native";

/** 검색창 높이. 옆의 보기 방식 버튼 묶음과 같다 */
export const GOODS_SEARCH_HEIGHT = 40;
/** 왼쪽 돋보기 */
const SEARCH_ICON_SIZE = 16;
/** 지우기 버튼 지름 · 안의 × */
const CLEAR_SIZE = 28;
const CLEAR_ICON_SIZE = 10;

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** 배치용 (flex) */
  style?: StyleProp<ViewStyle>;
};

/**
 * 내 굿즈 목록 안 검색창. 입력하는 대로 거르므로 검색 버튼이 없다.
 * 검색 탭의 SearchBar(높이 52, 검색 버튼)와 모양이 달라서 따로 둔다.
 */
export function GoodsSearchField({ value, onChangeText, style }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: space[8],
          height: GOODS_SEARCH_HEIGHT,
          borderRadius: radius.full,
          borderWidth: border.default,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          paddingLeft: space[12],
          paddingRight: space[6],
        },
        style,
      ]}
    >
      <Ionicons name="search" size={SEARCH_ICON_SIZE} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t("goods.searchPlaceholder")}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={colors.accent}
        accessibilityLabel={t("goods.searchPlaceholder")}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        // 한 줄 입력창에 lineHeight 를 주면 Android 에서 글자가 위로 밀려 잘린다 (SearchBar 와 같은 이유)
        style={{
          flex: 1,
          minWidth: 0,
          alignSelf: "stretch",
          paddingVertical: 0,
          textAlignVertical: "center",
          includeFontPadding: false,
          fontFamily: fonts.sans.regular,
          fontSize: typography.label.fontSize,
          color: colors.text,
        }}
      />
      {value !== "" && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel={t("search.clear")}
          hitSlop={space[6]}
          style={({ pressed }) => ({
            width: CLEAR_SIZE,
            height: CLEAR_SIZE,
            borderRadius: radius.full,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.bg,
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <CloseIcon size={CLEAR_ICON_SIZE} />
        </Pressable>
      )}
    </View>
  );
}
