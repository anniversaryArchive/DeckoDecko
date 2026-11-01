import { useTranslation } from "react-i18next";

import { radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

/** 고정 공지 앞의 "고정" 배지 (공지 목록 · 상세) */
export function NoticeFixedBadge() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
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
      {t("notice.fixedBadge")}
    </Text>
  );
}
