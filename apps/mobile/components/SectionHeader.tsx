import { View } from "react-native";

import { radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

type Props = {
  title: string;
  /** 제목 글자 단계. 홈 titleLg(17), 검색 titleMd(16). */
  variant?: "titleLg" | "titleMd";
  /** 제목 바로 옆 알약 (홈 "NEW"). */
  badge?: string;
  /** 오른쪽 끝 보조 문구 ("최근 10일"). */
  caption?: string;
};

/** 섹션 제목 한 줄. 좌우 여백 · 아래 간격은 쓰는 쪽에서 준다. */
export function SectionHeader({ title, variant = "titleLg", badge, caption }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space[8] }}>
      <Text variant={variant} accessibilityRole="header">
        {title}
      </Text>
      {badge != null && (
        <Text
          variant="captionSm"
          weight="bold"
          color="accent"
          style={{
            backgroundColor: colors.accentSoft,
            borderRadius: radius.full,
            overflow: "hidden",
            paddingHorizontal: space[8],
            paddingVertical: space[2],
          }}
        >
          {badge}
        </Text>
      )}
      {caption != null && (
        <Text variant="caption" color="textMuted" style={{ marginLeft: "auto" }}>
          {caption}
        </Text>
      )}
    </View>
  );
}
