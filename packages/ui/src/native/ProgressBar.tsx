import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { radius, space, type ThemeColors } from "../tokens";
import { Text } from "./Text";

/** 요약 막대 높이 (홈 소장률 카드) */
const SUMMARY_HEIGHT = 10;
/** 칸 막대 높이 (가챠 상세) */
const SEGMENT_HEIGHT = 8;
/** 범례 점 지름 */
const LEGEND_DOT = 8;
/** 칸이 이보다 많으면 칸 사이를 좁힌다 (칸이 너무 가늘어지지 않게) */
const DENSE_SEGMENTS = 20;

type CommonProps = {
  /** 화면 읽기 프로그램이 읽을 이름 ("내 굿즈 소장률") */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export type ProgressBarProps =
  | (CommonProps & {
      /** 한 줄 막대. 홈 소장률 카드처럼 강조 면 위에 둔다 (막대 바탕이 흰 면) */
      variant: "summary";
      /** 채운 비율 0 – 1. 밖의 값은 잘라 낸다 */
      value: number;
    })
  | (CommonProps & {
      /** 아이템 하나가 한 칸. GET → WISH → 미등록 순으로 칠한다 (가챠 상세) */
      variant: "segments";
      get: number;
      wish: number;
      /** 전체 칸 수 (라인업 종 수). get + wish 가 넘으면 넘는 만큼 그리지 않는다 */
      total: number;
      /**
       * 넘기면 막대 아래에 범례를 그린다. 글자는 쓰는 쪽에서 ("GET 3", "WISH 2", "미등록 1").
       * 화면 읽기 프로그램도 이 글자를 막대의 값으로 읽는다. 없으면 GET 수만 값으로 읽는다
       */
      legend?: { get: string; wish: string; none: string };
    });

/**
 * 진행 막대. 한 줄 막대(summary)와 칸 막대(segments) 두 가지.
 * 지금은 소장률에 쓴다: 홈 "내 굿즈 소장률"(summary), 가챠 상세 "이 가챠 소장률"(segments).
 */
export function ProgressBar(props: ProgressBarProps) {
  return props.variant === "summary" ? <SummaryBar {...props} /> : <SegmentBar {...props} />;
}

function SummaryBar({
  value,
  accessibilityLabel,
  style,
}: Extract<ProgressBarProps, { variant: "summary" }>) {
  const { colors } = useTheme();
  const ratio = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={[
        {
          height: SUMMARY_HEIGHT,
          borderRadius: radius.full,
          backgroundColor: colors.surface,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: SUMMARY_HEIGHT,
          borderRadius: radius.full,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}

function SegmentBar({
  get,
  wish,
  total,
  legend,
  accessibilityLabel,
  style,
}: Extract<ProgressBarProps, { variant: "segments" }>) {
  const count = Math.max(0, Math.floor(total));
  const getCount = Math.min(count, Math.max(0, Math.floor(get)));
  const wishCount = Math.min(count - getCount, Math.max(0, Math.floor(wish)));
  const segments: (keyof ThemeColors)[] = Array.from({ length: count }, (_, i) =>
    i < getCount ? "getMark" : i < getCount + wishCount ? "primary" : "line"
  );
  return (
    <View style={[{ gap: space[10] }, style]}>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        // 숫자 값(now)에는 GET 수만 들어가서, 범례가 있으면 범례 글자(GET · WISH · 미등록)를 값으로 읽는다
        accessibilityValue={
          legend
            ? { text: [legend.get, legend.wish, legend.none].join(", ") }
            : { min: 0, max: count, now: getCount }
        }
        style={{ flexDirection: "row", gap: count > DENSE_SEGMENTS ? space[2] : space[4] }}
      >
        {/* 종 수를 모르면(0) 빈 막대 하나 */}
        {(segments.length ? segments : (["line"] as const)).map((color, i) => (
          <Segment key={i} color={color} />
        ))}
      </View>
      {legend ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: space[14] }}>
          <LegendItem color="getMark" label={legend.get} />
          <LegendItem color="primary" label={legend.wish} />
          <LegendItem color="line" label={legend.none} />
        </View>
      ) : null}
    </View>
  );
}

function Segment({ color }: { color: keyof ThemeColors }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        height: SEGMENT_HEIGHT,
        borderRadius: radius.bar,
        backgroundColor: colors[color],
      }}
    />
  );
}

function LegendItem({ color, label }: { color: keyof ThemeColors; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space[4] }}>
      <View
        style={{
          width: LEGEND_DOT,
          height: LEGEND_DOT,
          borderRadius: radius.full,
          backgroundColor: colors[color],
        }}
      />
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}
