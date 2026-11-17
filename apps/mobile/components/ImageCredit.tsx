import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import type { StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import { Text } from "@deckodecko/ui/native";

import { imageSources, type ImageItem } from "@/lib/imageSource";

type Lists = readonly (readonly ImageItem[] | undefined)[];

/**
 * 공식 이미지의 출처 문구 ("이미지 출처 © BANDAI"). 출처를 표시할 이미지가 없으면 null.
 * lists: 화면에 보이는 이미지를 가진 항목 목록들 (섹션마다 하나, 아직 못 받은 목록은 undefined).
 */
export function useImageCredit(lists: Lists): string | null {
  const { t } = useTranslation();
  const sources = imageSources(lists);
  if (sources.length === 0) return null;
  return t("common.imageCredit", {
    sources: sources.map((source) => t(`common.imageSource.${source}`)).join(" · "),
  });
}

type Props = {
  /** 이 화면(목록)에 보이는 이미지를 가진 항목 목록들. 출처를 표시할 이미지가 없으면 감싼 View 까지 그리지 않는다 */
  lists: Lists;
  /** 감싼 View 의 여백 · 정렬. 놓일 자리마다 다르다 */
  style?: StyleProp<ViewStyle>;
  /** 위 섹션이 생기고 없어질 때 같이 미끄러져야 하면 그 레이아웃 애니메이션 */
  layout?: ComponentProps<typeof Animated.View>["layout"];
};

/**
 * 공식 이미지의 출처 한 줄. 카드 목록은 카드마다가 아니라 목록 아래에 한 번만 둔다.
 * 제공처는 이미지 주소의 호스트로 정한다 (lib/imageSource).
 */
export function ImageCredit({ lists, style, layout }: Props) {
  const credit = useImageCredit(lists);
  if (credit == null) return null;
  return (
    <Animated.View layout={layout} style={style}>
      <Text variant="captionSm" color="textMuted">
        {credit}
      </Text>
    </Animated.View>
  );
}
