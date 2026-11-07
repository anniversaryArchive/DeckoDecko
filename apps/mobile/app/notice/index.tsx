import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Notice } from "@deckodecko/core";
import { useNotices } from "@deckodecko/core/react";
import { border, gutter, radius, space, useTheme } from "@deckodecko/ui";
import { Button, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { EmptyState } from "@/components/EmptyState";
import { NoticeMeta } from "@/components/NoticeMeta";
import { QueryState } from "@/components/QueryState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { joinLabel } from "@/hooks/useGachaDisplay";
import { formatDateTime } from "@/lib/i18n";
import { openNotice } from "@/lib/routes";

/** 빈 화면 "홈으로 돌아가기" 버튼의 집 아이콘 */
const HOME_ICON_SIZE = 18;
/** 카드 미리보기로 넘길 최대 글자 수. 두 줄만 보이는데 Text 는 렌더링마다 글자 전체를 글꼴별로 나눈다 */
const PREVIEW_MAX_LENGTH = 200;

/**
 * 공지 목록 (시안 B_Notice · B_NoticeEmpty). 홈 공지 띠를 누르면 여기로 온다.
 * 고정 공지가 먼저, 각각 최신순 (저장소가 정렬한다). 누르면 공지 상세.
 */
export default function NoticeListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const notices = useNotices();
  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={t("notice.title")} />
      <QueryState
        query={notices}
        isEmpty={(list) => list.length === 0}
        fill
        empty={<NoticeEmpty />}
      >
        {(list) => (
          <FlatList
            data={list}
            keyExtractor={(notice) => notice.id}
            renderItem={({ item }) => <NoticeCard notice={item} />}
            contentContainerStyle={{
              paddingTop: space[10],
              paddingHorizontal: gutter,
              paddingBottom: insets.bottom + space[24],
              gap: space[10],
            }}
          />
        )}
      </QueryState>
    </View>
  );
}

/** 공지 한 장: (고정) · 날짜 · 제목 · 내용 앞부분 두 줄 */
function NoticeCard({ notice }: { notice: Notice }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const date = formatDateTime(new Date(notice.createdAt));
  return (
    <Pressable
      onPress={() => openNotice(notice.id)}
      accessibilityRole="button"
      // 내용은 화면에서만 두 줄로 잘리고 화면 읽기는 전부 읽으므로, 이름은 고정 · 제목 · 날짜만
      accessibilityLabel={joinLabel([
        notice.isFixed ? t("notice.fixedBadge") : null,
        notice.title,
        date,
      ])}
      style={({ pressed }) => ({
        gap: space[6],
        paddingVertical: space[14],
        paddingHorizontal: space[16],
        borderRadius: radius.tile,
        borderWidth: border.default,
        borderColor: notice.isFixed ? colors.primary : colors.line,
        backgroundColor: colors.surface,
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      <NoticeMeta notice={notice} />
      <Text variant="titleSm">{notice.title}</Text>
      {/* 빈 줄로 시작하면 Android 는 첫 줄 뒤에 … 만 보여서 미리보기에서는 공백을 합친다 */}
      <Text variant="caption" color="textMuted" numberOfLines={2}>
        {notice.content.replace(/\s+/g, " ").trim().slice(0, PREVIEW_MAX_LENGTH)}
      </Text>
    </Pressable>
  );
}

/** 공지가 하나도 없을 때. 출시 때 공지 없이 나갈 수도 있다 */
function NoticeEmpty() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <EmptyState
      icon="megaphone-outline"
      title={t("notice.emptyTitle")}
      description={t("notice.emptyDescription")}
      action={
        // 스택에 홈이 있으면 거기까지 닫고, 링크로 바로 열려 없으면 홈으로 바꾼다
        <Button
          size="md"
          icon={<Ionicons name="home" size={HOME_ICON_SIZE} color={colors.onPrimary} />}
          onPress={() => router.dismissTo("/")}
        >
          {t("notice.goHome")}
        </Button>
      }
    />
  );
}
