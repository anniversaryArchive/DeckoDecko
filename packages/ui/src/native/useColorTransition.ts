import { useEffect, useRef } from "react";
import { useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";

/** 색이 바뀌는 데 걸리는 시간(ms). 소장률 막대 칸 · WISH/GET 태그가 같이 쓴다 */
export const COLOR_TRANSITION_DURATION = 250;

/**
 * color 가 바뀌면 이전 색에서 COLOR_TRANSITION_DURATION 동안 서서히 바뀌는 값. useAnimatedStyle 안에서 `.value` 로 읽는다.
 * 기기의 "동작 줄이기"가 켜져 있으면 바로 바뀐다 (withTiming 기본값 ReduceMotion.System).
 */
export function useColorTransition(color: string): SharedValue<string> {
  const value = useSharedValue(color);
  const prev = useRef(color);
  useEffect(() => {
    // 처음 그릴 때는 같은 색으로 가는 애니메이션을 돌리지 않는다
    if (prev.current === color) return;
    prev.current = color;
    value.value = withTiming(color, { duration: COLOR_TRANSITION_DURATION });
  }, [value, color]);
  return value;
}
