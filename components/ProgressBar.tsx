import "react-native-reanimated/src/initializers"; // TODO: 4.1.1 버전 출시 시 제거
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";

import { Typography } from "@/components";
import { getColor } from "@/utils/color";

interface IProgressBarProps {
  value: number; // 0-100 (default. 0)
  height?: number; // default. 7
  activeColor?: string; // tailwind color key (e.g. "primary", "primary.light") 또는 hex color
  backgroundColor?: string; // tailwind color key (e.g. "primary", "primary.light") 또는 hex color
}

export default function ProgressBar(props: IProgressBarProps) {
  const { value = 0, height = 7, activeColor = "primary", backgroundColor = "gray.03" } = props;

  // ProgressBar 가 부드럽게 크기가 변경되기 위한 애니메이션 작업
  const animatedWidth = useSharedValue(0);
  useEffect(() => {
    const clampedValue = Math.max(0, Math.min(100, value));
    animatedWidth.value = withTiming(clampedValue, { duration: 500 });
  }, [value, animatedWidth]);
  const animatedStyle = useAnimatedStyle(() => {
    return { width: `${animatedWidth.value}%` };
  });

  return (
    <View
      className="w-full rounded-full relative overflow-hidden"
      style={{ height, backgroundColor: getColor(backgroundColor) }}
    >
      <Animated.View
        className="h-full rounded-full absolute left-0 top-0"
        style={[
          {
            minWidth: height, // 0인 경우에도 표기는 되도록
            backgroundColor: getColor(activeColor),
          },
          animatedStyle,
        ]}
      />
      <View className="flex justify-center flex-row my-auto">
        <Typography variant="body3" color="secondary-dark">
          {value}%
        </Typography>
      </View>
    </View>
  );
}
