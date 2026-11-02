import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, KeyboardAvoidingView, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FEEDBACK_MAX_LENGTH,
  isFeedbackLimitError,
  type FeedbackKind,
  type FeedbackPhoto,
  type Media,
  type SendFeedbackInput,
} from "@deckodecko/core";
import { useIsOnline, useSendFeedback } from "@deckodecko/core/react";
import { border, gutter, radius, space, useTheme } from "@deckodecko/ui";
import {
  Button,
  CloseIcon,
  IconButton,
  Input,
  PRESSED_OPACITY,
  Segment,
  Text,
  useToast,
} from "@deckodecko/ui/native";

import { HEADER_ICON_BUTTON_SIZE, HeaderIconButton } from "@/components/HeaderIconButton";
import { MediaField } from "@/components/MediaField";
import { goBackOrHome } from "@/lib/routes";

/** 종류마다 내용 칸 안내 · 사진 안내. 버그 ↔ 제안은 칸이 같아서 이 글로만 구분된다 */
const KIND_HINTS = {
  request: {
    placeholder: "feedback.contentPlaceholderRequest",
    photo: "feedback.photoHintRequest",
  },
  bug: { placeholder: "feedback.contentPlaceholderBug", photo: "feedback.photoHintBug" },
  idea: { placeholder: "feedback.contentPlaceholderIdea", photo: "feedback.photoHintIdea" },
} as const satisfies Record<FeedbackKind, { placeholder: string; photo: string }>;

/** 사진 칸 (정사각형) */
const PHOTO_SIZE = 72;
/** 빈 사진 칸의 아이콘 */
const PHOTO_ICON_SIZE = 20;
/** 사진 위 지우기 버튼 지름 */
const PHOTO_CLEAR_SIZE = 24;
/** 지우기 버튼 안 × 크기 */
const PHOTO_CLEAR_ICON_SIZE = 10;

/**
 * 요청 · 문의 보내기 (시안 B_Feedback). 검색 결과 없음과 설정에서 들어온다 (openFeedback).
 * 진입점은 useCanSendFeedback 으로 숨긴다. 내 문의 화면은 1.0 범위가 아니라, 보낸 뒤에는 토스트로 알리고 돌아간다.
 */
export default function FeedbackScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const online = useIsOnline();
  const send = useSendFeedback();
  const params = useLocalSearchParams<{ gachaName?: string }>();

  const [kind, setKind] = useState<FeedbackKind>("request");
  const [gachaName, setGachaName] = useState(
    (params.gachaName ?? "").slice(0, FEEDBACK_MAX_LENGTH.gachaName)
  );
  const [pickedMedia, setPickedMedia] = useState<Media | null>(null);
  const [mediaText, setMediaText] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<FeedbackPhoto | null>(null);

  const isRequest = kind === "request";
  const filled = (isRequest ? gachaName : content).trim().length > 0;
  // 오프라인이면 보내기가 멈춘 채 기다리므로 누르지 못하게 한다
  const canSend = filled && online && !send.isPending;

  const pickPhoto = async () => {
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
    } catch {
      toast.show({ title: t("feedback.photoFailed"), message: t("feedback.photoFailedHint") });
      return;
    }
    const picked = result.canceled ? undefined : result.assets[0];
    if (picked) setPhoto({ uri: picked.uri, mimeType: picked.mimeType });
  };

  const submit = async () => {
    if (!canSend) return;
    const media = pickedMedia
      ? { id: pickedMedia.id }
      : mediaText.trim()
        ? { text: mediaText }
        : null;
    const input: SendFeedbackInput = isRequest
      ? { kind, gachaName, media, content, photo }
      : { kind, content, photo };
    try {
      await send.mutateAsync(input);
    } catch {
      // 안내는 send.error 로 보내기 버튼 위에 보인다
      return;
    }
    goBackOrHome();
    toast.show({ title: t("feedback.sent") });
  };

  const notice = !online
    ? t("feedback.offlineHint")
    : send.isError
      ? t(isFeedbackLimitError(send.error) ? "feedback.dailyLimit" : "feedback.sendFailed")
      : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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
          {t("feedback.title")}
        </Text>
        {/* 제목을 가운데에 두려고 뒤로 버튼만큼 자리를 둔다 */}
        <View style={{ width: HEADER_ICON_BUTTON_SIZE }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: space[10],
          paddingHorizontal: gutter,
          paddingBottom: space[16],
          gap: space[16],
        }}
      >
        <Segment
          value={kind}
          onChange={(next) => {
            if (!send.isPending) setKind(next);
          }}
          accessibilityLabel={t("feedback.kindLabel")}
          style={{
            backgroundColor: colors.surface,
            borderWidth: border.default,
            borderColor: colors.line,
          }}
          options={[
            { value: "request", label: t("feedback.kindRequest") },
            { value: "bug", label: t("feedback.kindBug") },
            { value: "idea", label: t("feedback.kindIdea") },
          ]}
        />

        {isRequest ? (
          <>
            <Input
              label={t("feedback.gachaNameLabel")}
              value={gachaName}
              onChangeText={setGachaName}
              editable={!send.isPending}
              maxLength={FEEDBACK_MAX_LENGTH.gachaName}
              clearLabel={t("common.clear")}
              returnKeyType="done"
            />
            <MediaField
              picked={pickedMedia}
              onPick={setPickedMedia}
              text={mediaText}
              onTextChange={setMediaText}
              disabled={send.isPending}
            />
          </>
        ) : null}

        <Input
          label={t(isRequest ? "feedback.detailLabel" : "feedback.contentLabel")}
          placeholder={t(KIND_HINTS[kind].placeholder)}
          value={content}
          onChangeText={setContent}
          editable={!send.isPending}
          maxLength={FEEDBACK_MAX_LENGTH.content}
          multiline
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: space[10] }}>
          <View>
            <Pressable
              onPress={pickPhoto}
              disabled={send.isPending}
              accessibilityRole="button"
              accessibilityLabel={t("feedback.photo")}
              style={({ pressed }) => ({
                width: PHOTO_SIZE,
                height: PHOTO_SIZE,
                borderRadius: radius.field,
                borderWidth: border.default,
                borderStyle: photo ? "solid" : "dashed",
                borderColor: colors.line,
                backgroundColor: colors.surface,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                gap: space[4],
                opacity: pressed ? PRESSED_OPACITY : 1,
              })}
            >
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Ionicons name="image-outline" size={PHOTO_ICON_SIZE} color={colors.textMuted} />
                  <Text variant="captionSm" color="textMuted">
                    {t("feedback.photo")}
                  </Text>
                </>
              )}
            </Pressable>
            {photo ? (
              <View style={{ position: "absolute", top: space[4], right: space[4] }}>
                <IconButton
                  size={PHOTO_CLEAR_SIZE}
                  label={t("feedback.removePhoto")}
                  onPress={() => {
                    if (!send.isPending) setPhoto(null);
                  }}
                >
                  <CloseIcon size={PHOTO_CLEAR_ICON_SIZE} />
                </IconButton>
              </View>
            ) : null}
          </View>
          <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
            {t(KIND_HINTS[kind].photo)}
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          paddingTop: space[8],
          paddingHorizontal: gutter,
          paddingBottom: insets.bottom + space[16],
          gap: space[10],
        }}
      >
        {notice ? (
          <Text
            variant="captionSm"
            color="accent"
            accessibilityLiveRegion="polite"
            style={{ textAlign: "center" }}
          >
            {notice}
          </Text>
        ) : null}
        <Button fullWidth disabled={!canSend} onPress={submit}>
          {t("feedback.send")}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
