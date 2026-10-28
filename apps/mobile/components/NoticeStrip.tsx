import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { useHomeNotices } from "@deckodecko/core/react";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

/** 오른쪽 화살표 */
const CHEVRON_SIZE = 16;

/**
 * 홈 공지 띠. 고정 공지만 최신순 2개의 제목을 한 줄씩 보이고, 누르면 공지 목록(전체보기)으로 간다.
 * 고정 공지가 없으면(공지 저장소를 넘기지 않은 경우 포함) 띠를 통째로 숨긴다. 로딩 · 에러도 보조 정보라 그리지 않는다.
 */
export function NoticeStrip() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const notices = useHomeNotices();
  const list = notices.data ?? [];
  if (list.length === 0) return null;

  return (
    <Pressable
      onPress={() => router.push("/notice")}
      accessibilityRole="link"
      accessibilityLabel={[t("home.noticeAll"), ...list.map((n) => n.title)].join(", ")}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space[10],
        paddingVertical: space[8],
        paddingLeft: space[10],
        paddingRight: space[12],
        borderRadius: radius.tile,
        borderWidth: border.default,
        borderColor: colors.line,
        backgroundColor: colors.surface,
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      <Text
        variant="captionXs"
        color="onAccent"
        style={{
          backgroundColor: colors.accent,
          borderRadius: radius.full,
          overflow: "hidden",
          paddingHorizontal: space[8],
          paddingVertical: space[2],
        }}
      >
        {t("home.noticeBadge")}
      </Text>
      <View style={{ flex: 1, gap: space[2] }}>
        {list.map((notice) => (
          <Text key={notice.id} variant="caption" weight="medium" numberOfLines={1}>
            {notice.title}
          </Text>
        ))}
      </View>
      <Ionicons name="chevron-forward" size={CHEVRON_SIZE} color={colors.textMuted} />
    </Pressable>
  );
}
