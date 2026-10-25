import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { View } from "react-native";

import { radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

/** 원형 아이콘 한 변 */
const ICON_CIRCLE_SIZE = 92;
/** 원 안의 아이콘 */
const ICON_SIZE = 40;
/** 안내를 가운데보다 조금 위로 올리는 값 (아래 탭 바 · 키보드 쪽으로 쏠려 보이지 않게) */
const LIFT = 60;

type Props = {
  /** 원 안 아이콘 (Ionicons 이름). 시안의 일러스트 대신 쓴다 */
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  /** 제목 아래 안내. 줄바꿈은 문구의 \n 으로 */
  description?: string;
  /** 안내 아래에 둘 버튼 등 (검색 결과 없음의 "등록 요청하기") */
  action?: ReactNode;
};

/**
 * 내용이 없을 때의 큰 안내 (검색 결과 없음, 앞으로 빈 폴더 · 빈 목록).
 * 부모가 준 공간을 채우고 가운데 둔다. 로딩 · 에러처럼 문구 한 줄이면 StateMessage.
 */
export function EmptyState({ icon, title, description, action }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: space[18],
        paddingHorizontal: space[16],
        paddingBottom: LIFT,
      }}
    >
      <View
        style={{
          width: ICON_CIRCLE_SIZE,
          height: ICON_CIRCLE_SIZE,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentSoft,
        }}
      >
        <Ionicons name={icon} size={ICON_SIZE} color={colors.accent} />
      </View>
      <View style={{ gap: space[6] }}>
        <Text variant="titleLg" style={{ textAlign: "center" }}>
          {title}
        </Text>
        {description != null && (
          <Text variant="label" weight="regular" color="textMuted" style={{ textAlign: "center" }}>
            {description}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}
