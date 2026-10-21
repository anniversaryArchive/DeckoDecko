import type { ReactNode } from "react";
import { Pressable, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { border, radius, space, typography, type TypographyName } from "../tokens";
import { Card } from "./Card";
import { PRESSED_OPACITY } from "./pressable";
import { Text } from "./Text";

/** 세로 카드의 폭과 사진 높이. md: 홈 "새로 나왔어요", sm: 검색 "최근 본 굿즈" */
const VERTICAL_SIZE = {
  md: { width: 156, imageHeight: 140 },
  sm: { width: 124, imageHeight: 110 },
} as const;
/** 가로 카드(인기 · 검색 결과 목록)의 썸네일 한 변 */
const HORIZONTAL_THUMB = 96;
/** 이름은 두 줄까지 */
const TITLE_LINES = 2;

export type GoodsCardBadge = {
  label: string;
  /** accent: "NEW" (진한 포인트 면), get: "발매 예정" (GET 면) */
  tone: "accent" | "get";
};

type CommonProps = {
  /** 사진 자리. 자리의 크기는 카드가 정하고, 넣은 것이 그 자리를 채운다 (앱의 썸네일 컴포넌트) */
  image?: ReactNode;
  /** 작품명 (이름 위 작은 글자) */
  caption?: string | null;
  /** 가챠 이름. 두 줄까지 */
  title: string;
  /** 가격 ("400엔", "1회 400엔"). 포맷은 쓰는 쪽에서 한다 */
  price?: string | null;
  /** 사진 왼쪽 위 배지 */
  badge?: GoodsCardBadge | null;
  onPress?: () => void;
  /** 생략하면 작품명 · 이름 · 가격 · 보조 정보를 이어서 읽는다 */
  accessibilityLabel?: string;
  /** 배치용 (가로 스크롤의 간격 등) */
  style?: StyleProp<ViewStyle>;
};

export type GoodsCardProps =
  | (CommonProps & {
      /** 사진 위 · 글자 아래로 쌓은 카드. 가로 스크롤에 쓴다 */
      layout?: "vertical";
      /** md: 홈 "새로 나왔어요" (156), sm: 검색 "최근 본 굿즈" (124). sm 은 가격을 그리지 않는다 */
      size?: "md" | "sm";
    })
  | (CommonProps & {
      /** 사진 왼쪽 · 글자 오른쪽의 가로 카드. 인기 목록 · 검색 결과 목록에 쓴다 */
      layout: "horizontal";
      /** 가격 옆 작은 글자 ("(세금 포함)") */
      priceNote?: string | null;
      /** 마지막 줄 ("2026년 10월 발매 · 전 6종") */
      meta?: string | null;
      /**
       * 오른쪽 끝 세로 칸 (위시 버튼 · 소장 개수). 위아래 끝으로 벌려 놓는다.
       * 카드를 누르는 영역 밖에 두어서, 화면 읽기 프로그램이 안의 버튼을 따로 고를 수 있다.
       */
      accessory?: ReactNode;
    });

/**
 * 가챠 카드. 홈 "새로 나왔어요" · 검색 "최근 본 굿즈"(세로)와 인기 목록 · 검색 결과(가로)에 쓴다.
 * 글자는 모두 넘겨받는다 (i18n · 포맷은 앱에서). 사진도 앱이 넘긴다 (이미지 없을 때의 자리 표시 포함).
 */
export function GoodsCard(props: GoodsCardProps) {
  const label =
    props.accessibilityLabel ??
    [
      props.caption,
      props.title,
      props.price,
      props.layout === "horizontal" ? props.priceNote : null,
      props.layout === "horizontal" ? props.meta : null,
    ]
      .filter(Boolean)
      .join(", ")
      // "2026년 10월 발매 · 전 6종" 의 " · " 는 기호로 읽힐 수 있어서 쉼표로
      .replaceAll(" · ", ", ");
  return props.layout === "horizontal" ? (
    <HorizontalCard {...props} accessibilityLabel={label} />
  ) : (
    <VerticalCard {...props} accessibilityLabel={label} />
  );
}

/**
 * 글자 n 줄의 높이. 세로 카드는 가로 스크롤에서 나란히 놓이므로, 작품명 · 가격이 없거나 이름이 한 줄이어도
 * 같은 높이가 되도록 자리를 잡아 둔다. 시스템 글자 크기를 키우면 줄 높이도 같이 커진다.
 */
function useLinesHeight() {
  const { fontScale } = useWindowDimensions();
  return (variant: TypographyName, lines = 1) => typography[variant].lineHeight * fontScale * lines;
}

function VerticalCard({
  size = "md",
  image,
  caption,
  title,
  price,
  badge,
  onPress,
  accessibilityLabel,
  style,
}: Extract<GoodsCardProps, { layout?: "vertical" }>) {
  const { colors } = useTheme();
  const linesHeight = useLinesHeight();
  const { width, imageHeight } = VERTICAL_SIZE[size];
  const small = size === "sm";
  const captionVariant = small ? "captionXs" : "captionSm";
  const titleVariant = small ? "caption" : "bodyStrong";
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[{ width }, small && { borderRadius: radius.row }, style]}
    >
      <View
        style={[
          { height: imageHeight, backgroundColor: colors.accentSoft },
          // 최근 본 굿즈는 흰 사진이 많아 사진과 글자 사이에 선을 둔다 (시안)
          small && { borderBottomWidth: border.default, borderBottomColor: colors.lineSoft },
        ]}
      >
        {image}
        {badge ? <Badge {...badge} /> : null}
      </View>
      <View
        style={
          small
            ? { paddingTop: space[8], paddingHorizontal: space[10], paddingBottom: space[10] }
            : { paddingTop: space[12], paddingHorizontal: space[14], paddingBottom: space[14] }
        }
      >
        <Text
          variant={captionVariant}
          weight="regular"
          color="textMuted"
          numberOfLines={1}
          style={{ minHeight: linesHeight(captionVariant) }}
        >
          {caption ?? ""}
        </Text>
        <Text
          variant={titleVariant}
          weight="bold"
          numberOfLines={TITLE_LINES}
          style={{ marginTop: space[2], minHeight: linesHeight(titleVariant, TITLE_LINES) }}
        >
          {title}
        </Text>
        {small ? null : (
          <Text
            variant="caption"
            weight="bold"
            color="accent"
            numberOfLines={1}
            style={{ marginTop: space[2], minHeight: linesHeight("caption") }}
          >
            {price ?? ""}
          </Text>
        )}
      </View>
    </Card>
  );
}

function HorizontalCard({
  image,
  caption,
  title,
  price,
  priceNote,
  meta,
  badge,
  accessory,
  onPress,
  accessibilityLabel,
  style,
}: Extract<GoodsCardProps, { layout: "horizontal" }>) {
  const { colors } = useTheme();
  const body = (
    <>
      <View
        style={{
          width: HORIZONTAL_THUMB,
          height: HORIZONTAL_THUMB,
          borderRadius: radius.field,
          overflow: "hidden",
          backgroundColor: colors.accentSoft,
        }}
      >
        {image}
        {badge ? <Badge {...badge} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: space[2] }}>
        {caption ? (
          <Text variant="captionSm" color="textMuted" numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
        <Text variant="bodyStrong" numberOfLines={TITLE_LINES}>
          {title}
        </Text>
        {price ? (
          <Text variant="label" weight="bold" color="accent">
            {price}
            {priceNote ? (
              <Text variant="captionSm" weight="regular" color="textMuted">
                {` ${priceNote}`}
              </Text>
            ) : null}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
    </>
  );
  const bodyStyle: ViewStyle = {
    flex: 1,
    flexDirection: "row",
    gap: space[14],
    padding: space[12],
    // 오른쪽 칸이 있으면 글자와 그 칸 사이 간격은 오른쪽 칸이 준다
    paddingRight: accessory ? 0 : space[12],
  };
  return (
    // 카드 면(테두리 · 모서리)과 누르는 영역을 나눈다. 오른쪽 칸의 버튼이 카드 버튼 안에 묶이지 않게
    <Card style={[{ flexDirection: "row" }, style]}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          style={({ pressed }) => [bodyStyle, { opacity: pressed ? PRESSED_OPACITY : 1 }]}
        >
          {body}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={accessibilityLabel} style={bodyStyle}>
          {body}
        </View>
      )}
      {accessory ? (
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingVertical: space[12],
            paddingLeft: space[14],
            paddingRight: space[12],
          }}
        >
          {accessory}
        </View>
      ) : null}
    </Card>
  );
}

function Badge({ label, tone }: GoodsCardBadge) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        position: "absolute",
        left: space[6],
        top: space[6],
        paddingHorizontal: space[6],
        paddingVertical: space[2],
        borderRadius: radius.full,
        backgroundColor: tone === "accent" ? colors.accent : colors.getSurface,
      }}
    >
      <Text variant="captionXs" color={tone === "accent" ? "onAccent" : "onGet"}>
        {label}
      </Text>
    </View>
  );
}
