import { View } from "react-native";

import type { Notice } from "@deckodecko/core";
import { space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { NoticeFixedBadge } from "@/components/NoticeFixedBadge";
import { formatDateTime } from "@/lib/i18n";

/** 공지 제목 위의 (고정 배지) · 날짜 줄 (공지 목록 카드 · 상세) */
export function NoticeMeta({ notice }: { notice: Pick<Notice, "isFixed" | "createdAt"> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space[8] }}>
      {notice.isFixed ? <NoticeFixedBadge /> : null}
      <Text variant="captionSm" color="textMuted">
        {formatDateTime(new Date(notice.createdAt))}
      </Text>
    </View>
  );
}
