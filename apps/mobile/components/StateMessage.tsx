import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { space, useTheme } from "@deckodecko/ui";
import { Button, Text } from "@deckodecko/ui/native";

type Props = {
  message: string;
  /** 로딩 중이면 문구 위에 스피너를 둔다. */
  loading?: boolean;
  /** 화면 전체를 채우고 가운데 정렬 (상세의 로딩 · 에러 상태). */
  fill?: boolean;
  /** 주면 문구 아래에 "다시 시도" 버튼을 둔다 (에러 상태). 보통 쿼리의 refetch. */
  onRetry?: () => void;
};

/** 로딩 · 에러 · 짧은 빈 상태 안내 한 줄. 아이콘과 설명이 있는 큰 빈 화면은 EmptyState. */
export function StateMessage({ message, loading, fill, onRetry }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={[
        { alignItems: "center", justifyContent: "center", gap: space[8], padding: space[24] },
        fill && { flex: 1 },
      ]}
    >
      {loading && <ActivityIndicator color={colors.accent} />}
      <Text color="textMuted" style={{ textAlign: "center" }}>
        {message}
      </Text>
      {onRetry && (
        <Button variant="secondary" size="md" onPress={onRetry} style={{ alignSelf: "center" }}>
          {t("common.retry")}
        </Button>
      )}
    </View>
  );
}
