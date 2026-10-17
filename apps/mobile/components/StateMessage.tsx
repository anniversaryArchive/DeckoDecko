import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";

import { border, radius, space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

/** 다시 시도 버튼 높이 */
const RETRY_BUTTON_HEIGHT = 44;

type Props = {
  message: string;
  /** 로딩 중이면 문구 위에 스피너를 둔다. */
  loading?: boolean;
  /** 화면 전체를 채우고 가운데 정렬 (상세의 로딩 · 없음 상태). */
  fill?: boolean;
  /** 주면 문구 아래에 "다시 시도" 버튼을 둔다 (에러 상태). 보통 쿼리의 refetch. */
  onRetry?: () => void;
};

/** 로딩 · 에러 · 빈 상태 안내. */
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
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => ({
            height: RETRY_BUTTON_HEIGHT,
            justifyContent: "center",
            paddingHorizontal: space[18],
            borderRadius: radius.full,
            borderWidth: border.default,
            borderColor: colors.line,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text variant="bodyStrong">{t("common.retry")}</Text>
        </Pressable>
      )}
    </View>
  );
}
