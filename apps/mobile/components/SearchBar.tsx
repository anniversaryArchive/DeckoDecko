import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, TextInput, View } from "react-native";

import { border, fonts, radius, space, typography, useTheme } from "@deckodecko/ui";
import { CloseIcon, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

/** 검색창 높이 */
const HEIGHT = 52;
/** 왼쪽 돋보기 아이콘 */
const SEARCH_ICON_SIZE = 20;
/** 지우기 버튼 지름 · 안의 × (공용 Input 의 지우기 버튼과 같은 크기) */
const CLEAR_SIZE = 32;
const CLEAR_ICON_SIZE = 12;
/** 오른쪽 검색 버튼 높이. 검색창 안에 6씩 띄워 들어가야 해서 공용 Button(36 · 44)이 아니라 따로 둔다 */
const SUBMIT_HEIGHT = 40;

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** 검색 버튼 · 키보드의 검색 키 */
  onSubmit: () => void;
};

/**
 * 검색 탭의 둥근 검색창: 돋보기 + 입력 + 지우기 + 검색 버튼.
 * 공용 Input(높이 48, 모서리 field)과 모양이 달라서 따로 둔다 (시안: 높이 52, 끝까지 둥근 테두리, 안에 버튼).
 */
export function SearchBar({ value, onChangeText, onSubmit }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[10],
        height: HEIGHT,
        borderRadius: radius.full,
        borderWidth: border.default,
        borderColor: colors.primary,
        backgroundColor: colors.surface,
        paddingLeft: space[18],
        paddingRight: space[6],
      }}
    >
      <Ionicons name="search" size={SEARCH_ICON_SIZE} color={colors.accent} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={t("search.placeholder")}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={colors.accent}
        accessibilityLabel={t("search.placeholder")}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        // TextInput 은 Text 를 거치지 않으므로 글꼴 · 크기를 직접 준다 (입력 15 = titleSm 크기, 굵기는 regular).
        // 한 줄 입력창에 lineHeight 를 주면 Android 에서 글자가 위로 밀려 잘린다. 높이는 검색창이 정하고 글자는 가운데 둔다.
        style={{
          flex: 1,
          minWidth: 0,
          alignSelf: "stretch",
          paddingVertical: 0,
          textAlignVertical: "center",
          includeFontPadding: false,
          fontFamily: fonts.sans.regular,
          fontSize: typography.titleSm.fontSize,
          color: colors.text,
        }}
      />
      {value !== "" && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel={t("search.clear")}
          hitSlop={space[4]}
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
      <Pressable
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel={t("search.submit")}
        hitSlop={{ top: space[2], bottom: space[2] }}
        style={({ pressed }) => ({
          height: SUBMIT_HEIGHT,
          paddingHorizontal: space[18],
          borderRadius: radius.full,
          justifyContent: "center",
          backgroundColor: colors.primary,
          opacity: pressed ? PRESSED_OPACITY : 1,
        })}
      >
        <Text variant="bodyStrong" color="onPrimary">
          {t("search.submit")}
        </Text>
      </Pressable>
    </View>
  );
}
