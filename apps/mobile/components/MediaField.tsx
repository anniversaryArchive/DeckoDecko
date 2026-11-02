import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, View } from "react-native";

import { FEEDBACK_MAX_LENGTH, type Media } from "@deckodecko/core";
import { useMediaSearch } from "@deckodecko/core/react";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { CloseIcon, IconButton, Input, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { mediaTitle } from "@/lib/displayName";

/** 고른 작품 칸 높이 (입력칸과 같다) */
const PICKED_HEIGHT = 48;
/** 고른 작품의 지우기 버튼 지름 */
const CLEAR_SIZE = 32;
/** 지우기 버튼 안 × 크기 */
const CLEAR_ICON_SIZE = 12;
/** "그대로 보내기" 줄의 + 아이콘 */
const PLUS_ICON_SIZE = 18;

type Props = {
  /** 목록에서 고른 작품. 있으면 입력칸 대신 작품 이름을 보여 준다 */
  picked: Media | null;
  onPick: (media: Media | null) => void;
  /** 고르지 않고 적은 글자. 고르지 않은 채 보내면 이 글자를 그대로 보낸다 */
  text: string;
  onTextChange: (text: string) => void;
  disabled: boolean;
};

/**
 * 요청 · 문의의 작품 칸 (시안 B_Feedback · B_FeedbackMedia). 적는 동안 이름 · 별칭으로 찾은 작품을 아래에 보여 준다.
 * 목록을 받지 못해도 적은 글자로 보낼 수 있다.
 * 부모 ScrollView 에 keyboardShouldPersistTaps="handled" 를 걸어야 키보드가 떠 있을 때 목록을 누를 수 있다.
 */
export function MediaField({ picked, onPick, text, onTextChange, disabled }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const results = useMediaSearch(text);
  const typed = text.trim();

  if (picked) {
    return (
      <View style={{ gap: space[6] }}>
        <Text variant="caption" weight="bold" color="textMuted">
          {t("feedback.mediaLabel")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: space[8],
            minHeight: PICKED_HEIGHT,
            paddingLeft: space[14],
            paddingRight: space[8],
            borderRadius: radius.field,
            borderWidth: border.default,
            borderColor: colors.line,
            backgroundColor: colors.surface,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <MediaName media={picked} />
          </View>
          <IconButton
            size={CLEAR_SIZE}
            label={t("common.clear")}
            onPress={() => {
              if (!disabled) onPick(null);
            }}
          >
            <CloseIcon size={CLEAR_ICON_SIZE} />
          </IconButton>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: space[6] }}>
      <Input
        label={t("feedback.mediaLabel")}
        value={text}
        onChangeText={onTextChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        maxLength={FEEDBACK_MAX_LENGTH.mediaText}
        placeholder={t("feedback.mediaPlaceholder")}
        clearLabel={t("common.clear")}
        returnKeyType="done"
      />
      {focused && typed ? (
        <View
          style={{
            borderRadius: radius.field,
            borderWidth: border.default,
            borderColor: colors.line,
            backgroundColor: colors.surface,
            overflow: "hidden",
          }}
        >
          {(results.data ?? []).map((media) => (
            <Pressable
              key={media.id}
              onPress={() => {
                onPick(media);
                onTextChange("");
              }}
              accessibilityRole="button"
              style={({ pressed }) => ({
                paddingVertical: space[10],
                paddingHorizontal: space[14],
                borderBottomWidth: border.divider,
                borderBottomColor: colors.lineSoft,
                opacity: pressed ? PRESSED_OPACITY : 1,
              })}
            >
              <MediaName media={media} />
            </Pressable>
          ))}
          <Pressable
            onPress={() => Keyboard.dismiss()}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: space[10],
              paddingVertical: space[10],
              paddingHorizontal: space[14],
              backgroundColor: colors.bg,
              opacity: pressed ? PRESSED_OPACITY : 1,
            })}
          >
            <Ionicons name="add" size={PLUS_ICON_SIZE} color={colors.accent} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="bodyStrong" color="accent" numberOfLines={1}>
                {t("feedback.mediaUseText", { text: typed })}
              </Text>
              <Text variant="captionSm" color="textMuted">
                {t("feedback.mediaUseTextHint")}
              </Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** 고른 언어의 이름 아래에 일본어 원제목을 작게 둔다. 같으면 한 줄만 보인다. */
function MediaName({ media }: { media: Media }) {
  const { i18n } = useTranslation();
  const title = mediaTitle(media, i18n.language);
  const original = media.titleJa && media.titleJa !== title ? media.titleJa : null;
  return (
    <>
      <Text variant="bodyStrong" numberOfLines={1}>
        {title}
      </Text>
      {original ? (
        <Text variant="captionSm" color="textMuted" numberOfLines={1}>
          {original}
        </Text>
      ) : null}
    </>
  );
}
