import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { gutter, space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { HEADER_ICON_BUTTON_SIZE, HeaderIconButton } from "@/components/HeaderIconButton";
import { goBackOrHome } from "@/lib/routes";

type Props = {
  title: string;
};

/**
 * 스택 화면 머리글: 동그란 뒤로 버튼 + 가운데 제목 (시안 B_Notice · B_NoticeDetail).
 * 화면 맨 위에 두고, 이 화면의 Stack.Screen 은 headerShown: false 로 둔다. 위쪽 safe area 를 여기서 띄운다.
 */
export function ScreenHeader({ title }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: space[8],
        paddingTop: insets.top + space[16],
        paddingHorizontal: gutter,
        paddingBottom: space[8],
      }}
    >
      <HeaderIconButton
        icon="chevron-back"
        variant="outline"
        label={t("common.back")}
        onPress={goBackOrHome}
      />
      <Text
        variant="titleLg"
        accessibilityRole="header"
        numberOfLines={1}
        style={{ flexShrink: 1, textAlign: "center" }}
      >
        {title}
      </Text>
      {/* 제목을 가운데에 두려고 뒤로 버튼만큼 자리를 둔다 */}
      <View style={{ width: HEADER_ICON_BUTTON_SIZE }} />
    </View>
  );
}
