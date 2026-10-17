import { ActivityIndicator, View } from "react-native";

import { space, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

type Props = {
  message: string;
  /** 로딩 중이면 문구 위에 스피너를 둔다. */
  loading?: boolean;
  /** 화면 전체를 채우고 가운데 정렬 (상세의 로딩 · 없음 상태). */
  fill?: boolean;
};

/** 로딩 · 에러 · 빈 상태 안내. */
export function StateMessage({ message, loading, fill }: Props) {
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
    </View>
  );
}
