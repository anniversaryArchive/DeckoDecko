import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCanSendFeedback } from "@deckodecko/core/react";
import { border, gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Card, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { ScreenHeader } from "@/components/ScreenHeader";
import { chooseLanguage, isLanguage, type Language } from "@/lib/i18n";
import { openFeedback } from "@/lib/routes";

/** 스토어 등록 정보와 같은 주소로 둔다. 바꾸면 docs/image-takedown.md 도 같이 고친다. */
const CONTACT_EMAIL = "anniversaryarchive@gmail.com";
/** 스토어 등록 정보의 개인정보처리방침 URL 과 같은 주소로 둔다. 앱 안의 주소는 새 빌드를 내야 바뀐다. */
const PRIVACY_POLICY_URL = "https://anniversaryarchive.github.io/DeckoDecko/privacy/";

/** 목록 한 줄 높이 */
const ROW_HEIGHT = 50;
/** 줄 끝 아이콘 (고른 언어 체크, 메일, 바깥 링크) */
const ICON_SIZE = 20;
/** 다른 화면으로 가는 줄의 화살표 */
const CHEVRON_SIZE = 18;

/** 언어 목록. 이름은 그 언어로 적어서 어느 언어로 보든 같다. comingSoon 은 번역 전이라 고를 수 없다. */
const LANGUAGE_OPTIONS: readonly { code: Language | "ja"; name: string; comingSoon?: true }[] = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語", comingSoon: true },
];

/** 설정 (시안 B_Settings). 1.0 은 언어 고르기, 요청 · 문의 보내기, 개인정보처리방침, 연락처만 있다. 홈 머리글의 설정 버튼으로 들어온다. */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={t("settings.title")} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: space[10],
          paddingHorizontal: gutter,
          paddingBottom: insets.bottom + space[24],
          gap: space[16],
        }}
      >
        <LanguageSection />
        <InfoSection />
        <ContactSection />
      </ScrollView>
    </View>
  );
}

/** 제목 · 카드 · 안내문(있으면)으로 이루어진 설정 묶음 */
function SettingsSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: space[8] }}>
      <Text
        variant="caption"
        weight="bold"
        color="textMuted"
        accessibilityRole="header"
        style={{ paddingHorizontal: space[4] }}
      >
        {title}
      </Text>
      <Card style={{ paddingVertical: space[4], paddingHorizontal: space[14] }}>{children}</Card>
      {hint ? (
        <Text variant="captionSm" color="textMuted" style={{ paddingHorizontal: space[4] }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** 개인정보처리방침은 스토어 심사 요건이라 출시 빌드에서도 항상 보이고, 요청 · 문의는 보낼 수 있을 때만 보인다. */
function InfoSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const canSendFeedback = useCanSendFeedback();
  return (
    <SettingsSection title={t("settings.info")}>
      {canSendFeedback ? (
        <Pressable
          onPress={() => openFeedback()}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            height: ROW_HEIGHT,
            borderBottomWidth: border.divider,
            borderBottomColor: colors.lineSoft,
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <Text variant="body">{t("feedback.title")}</Text>
          <Ionicons name="chevron-forward" size={CHEVRON_SIZE} color={colors.textMuted} />
        </Pressable>
      ) : null}
      <Pressable
        onPress={() => {
          // 브라우저를 못 여는 기기는 사실상 없어서 따로 안내하지 않는다
          Linking.openURL(PRIVACY_POLICY_URL).catch(() => undefined);
        }}
        accessibilityRole="link"
        accessibilityLabel={t("settings.privacyPolicy")}
        accessibilityHint={t("settings.privacyOpenHint")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: space[8],
          minHeight: ROW_HEIGHT,
          opacity: pressed ? PRESSED_OPACITY : 1,
        })}
      >
        <Text variant="body" style={{ flexShrink: 1 }}>
          {t("settings.privacyPolicy")}
        </Text>
        <Ionicons name="open-outline" size={ICON_SIZE} color={colors.textMuted} />
      </Pressable>
    </SettingsSection>
  );
}

function ContactSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <SettingsSection title={t("settings.contact")} hint={t("settings.contactHint")}>
      <Pressable
        onPress={() => {
          // 메일 앱이 없으면 실패하지만, 주소가 화면에 보이므로 따로 안내하지 않는다
          Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => undefined);
        }}
        accessibilityRole="link"
        // 없으면 Android 가 아이콘 글리프까지 함께 읽는다
        accessibilityLabel={CONTACT_EMAIL}
        accessibilityHint={t("settings.contactOpenHint")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: space[8],
          minHeight: ROW_HEIGHT,
          opacity: pressed ? PRESSED_OPACITY : 1,
        })}
      >
        <Text variant="body" style={{ flexShrink: 1 }}>
          {CONTACT_EMAIL}
        </Text>
        <Ionicons name="mail-outline" size={ICON_SIZE} color={colors.textMuted} />
      </Pressable>
    </SettingsSection>
  );
}

function LanguageSection() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  return (
    <SettingsSection title={t("settings.language")} hint={t("settings.languageHint")}>
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
                disabled ? t("settings.comingSoonLabel", { name: option.name }) : option.name
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
                <Ionicons name="checkmark" size={ICON_SIZE} color={colors.accent} />
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
    </SettingsSection>
  );
}
