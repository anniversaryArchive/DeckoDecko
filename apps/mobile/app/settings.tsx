import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { border, gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Card, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { HEADER_ICON_BUTTON_SIZE, HeaderIconButton } from "@/components/HeaderIconButton";
import { chooseLanguage, isLanguage, type Language } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/routes";

/** 목록 한 줄 높이 */
const ROW_HEIGHT = 50;
/** 고른 언어 옆 체크 */
const CHECK_SIZE = 20;

/** 언어 목록. 이름은 그 언어로 적어서 어느 언어로 보든 같다. comingSoon 은 번역 전이라 고를 수 없다. */
const LANGUAGE_OPTIONS: readonly { code: Language | "ja"; name: string; comingSoon?: true }[] = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語", comingSoon: true },
];

/** 설정 (시안 B_Settings). 1.0 은 언어만 고른다. 홈 머리글의 설정 버튼으로 들어온다. */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
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
        <Text variant="titleLg" accessibilityRole="header">
          {t("settings.title")}
        </Text>
        {/* 제목을 가운데에 두려고 뒤로 버튼만큼 자리를 둔다 */}
        <View style={{ width: HEADER_ICON_BUTTON_SIZE }} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingTop: space[10],
          paddingHorizontal: gutter,
          paddingBottom: insets.bottom + space[24],
          gap: space[16],
        }}
      >
        <LanguageSection />
      </ScrollView>
    </View>
  );
}

function LanguageSection() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[8] }}>
      <Text
        variant="caption"
        weight="bold"
        color="textMuted"
        style={{ paddingHorizontal: space[4] }}
      >
        {t("settings.language")}
      </Text>
      <Card style={{ paddingVertical: space[4], paddingHorizontal: space[14] }}>
        <View accessibilityRole="radiogroup" accessibilityLabel={t("settings.language")}>
          {LANGUAGE_OPTIONS.map((option, i) => {
            const selected = option.code === i18n.resolvedLanguage;
            const disabled = option.comingSoon === true;
            const last = i === LANGUAGE_OPTIONS.length - 1;
            return (
              <Pressable
                key={option.code}
                disabled={disabled}
                onPress={() => {
                  if (isLanguage(option.code)) chooseLanguage(option.code);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled }}
                accessibilityLabel={
                  disabled ? `${option.name}, ${t("settings.comingSoon")}` : option.name
                }
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: ROW_HEIGHT,
                  borderBottomWidth: last ? 0 : border.divider,
                  borderBottomColor: colors.lineSoft,
                  opacity: pressed ? PRESSED_OPACITY : 1,
                })}
              >
                <Text
                  variant={selected ? "bodyStrong" : "body"}
                  color={disabled ? "textMuted" : "text"}
                >
                  {option.name}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark" size={CHECK_SIZE} color={colors.accent} />
                ) : null}
                {disabled ? (
                  <Text
                    variant="captionSm"
                    weight="bold"
                    color="textMuted"
                    style={{
                      backgroundColor: colors.bg,
                      borderWidth: border.divider,
                      borderColor: colors.line,
                      borderRadius: radius.full,
                      overflow: "hidden",
                      paddingHorizontal: space[8],
                      paddingVertical: space[2],
                    }}
                  >
                    {t("settings.comingSoon")}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Text variant="captionSm" color="textMuted" style={{ paddingHorizontal: space[4] }}>
        {t("settings.languageHint")}
      </Text>
    </View>
  );
}
