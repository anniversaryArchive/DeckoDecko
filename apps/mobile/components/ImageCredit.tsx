import { useTranslation } from "react-i18next";
import type { StyleProp, TextStyle } from "react-native";

import { Text } from "@deckodecko/ui/native";

/**
 * 공식 이미지(반다이 CDN)의 출처 한 줄. 공식 이미지가 보이는 화면에는 반드시 둔다 (ADR 0005).
 * 이미지가 하나도 없는 상태에서는 그리지 않도록 쓰는 쪽에서 조건을 건다.
 */
export function ImageCredit({ style }: { style?: StyleProp<TextStyle> }) {
  const { t } = useTranslation();
  return (
    <Text variant="captionSm" color="textMuted" style={[{ textAlign: "center" }, style]}>
      {t("common.imageCredit")}
    </Text>
  );
}
