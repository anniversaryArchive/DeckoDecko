import { useTranslation } from "react-i18next";
import type { StyleProp, TextStyle } from "react-native";

import { Text } from "@deckodecko/ui/native";

import { imageSources } from "@/lib/imageSource";

type Props = {
  /** 이 화면(목록)에 보이는 이미지 주소. 출처를 표시할 제공처의 이미지가 없으면 아무것도 그리지 않는다 */
  urls: readonly (string | null | undefined)[];
  /** 여백 · 정렬. 놓일 자리마다 다르다 */
  style?: StyleProp<TextStyle>;
};

/**
 * 공식 이미지의 출처 한 줄 ("이미지 출처 © BANDAI"). 카드 목록은 카드마다가 아니라 목록 아래에 한 번만 둔다.
 * 제공처는 이미지 주소의 호스트로 정한다 (lib/imageSource).
 */
export function ImageCredit({ urls, style }: Props) {
  const { t } = useTranslation();
  const sources = imageSources(urls);
  if (sources.length === 0) return null;
  return (
    <Text variant="captionSm" color="textMuted" style={style}>
      {t("common.imageCredit", {
        sources: sources.map((source) => t(`common.imageSource.${source}`)).join(" · "),
      })}
    </Text>
  );
}
