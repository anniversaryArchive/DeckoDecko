import React, { useEffect, useState, useMemo } from "react";
import { View, LayoutChangeEvent, DimensionValue } from "react-native";
import Svg, { Path } from "react-native-svg";

import { getColor } from "@/utils/color";

interface IWiggleDividerProps {
  margin?: number; // 선 바깥쪽 여백 (default. 4)

  strokeColor?: string; // tailwind color key (e.g. "primary", "primary.light") 또는 hex color
  strokeWidth?: number; // default. 2
  frequency?: number; // 얼마나 자주 흔들릴지 (0-100, default 100)
  wiggle?: number; // 진폭 (0-100, default 100)
  smoothen?: number; // 보간 부드러움 정도 (0-100, default 50)
}

const WiggleDivider: React.FC<IWiggleDividerProps> = ({
  strokeColor = "primary",
  strokeWidth = 2,
  frequency = 100,
  wiggle = 100,
  smoothen = 50,
  margin = 4,
}) => {
  const [path, setPath] = useState<string>("");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // seed : 랜덤 함수의 시드값 (일관된 결과를 생성하기 위한 값!)
  const memoizedPath = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const generatePath = (
      w: number,
      h: number,
      freq: number,
      wiggleAmount: number,
      smoothenAmount: number
    ) => {
      const points: { x: number; y: number }[] = [];
      let seedCounter = 0;

      // frequency가 높은수록 점이 많다. = 더 많이 흔들린다.
      const segmentLength = Math.max(2, 20 - (freq / 100) * 18);

      // wiggle이 높을수록 진폭이 더 크다.
      const maxDeviation = (wiggleAmount / 100) * (h / 2);

      // smoothen 높을수록 더 부드러운 곡선을 그려준다.
      const smoothnessFactor = smoothenAmount / 100;

      // 선의 중앙 y 위치
      const centerY = h / 2;

      // 가로선을 그리기 위한 점들 생성
      for (let x = 0; x <= w; x += segmentLength) {
        const actualX = Math.min(x, w);
        const deviation = (seededRandom(seedCounter++) - 0.5) * maxDeviation;
        points.push({ x: actualX, y: centerY + deviation });
      }

      // 마지막 점이 정확히 끝점에 위치하도록 보장
      if (points.length > 0 && points[points.length - 1].x < w) {
        const deviation = (seededRandom(seedCounter++) - 0.5) * maxDeviation;
        points.push({ x: w, y: centerY + deviation });
      }

      if (points.length === 0) return "";

      let pathString = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

      if (smoothnessFactor > 0.1) {
        // 베지어 곡선으로 부드럽게 연결
        for (let i = 1; i < points.length; i++) {
          const current = points[i];
          const prev = points[i - 1];

          // 곡선의 제어점 계산
          const tension = smoothnessFactor * 0.3;
          const cp1x = prev.x + (current.x - prev.x) * tension;
          const cp1y = prev.y + (current.y - prev.y) * tension;
          pathString += ` Q ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;
        }
      } else {
        // 직선으로 연결
        for (let i = 1; i < points.length; i++) {
          pathString += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
        }
      }

      return pathString;
    };

    // 실제 렌더링에 사용할 크기 계산 (여백을 뺀 실제 선 영역)
    const actualWidth = Math.max(10, containerSize.width - margin * 2);
    const actualHeight = Math.max(strokeWidth, 2); // 최소 2px 높이 보장

    return generatePath(actualWidth, actualHeight, frequency, wiggle, smoothen);
  }, [strokeWidth, frequency, wiggle, smoothen, containerSize, margin]);

  useEffect(() => {
    setPath(memoizedPath);
  }, [memoizedPath]);

  // container 크기 계산
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setContainerSize({ width: layoutWidth, height: layoutHeight });
  };

  // 실제 렌더링에 사용할 크기 계산 (여백을 뺀 실제 선 영역)
  const actualWidth = Math.max(10, containerSize.width - margin * 2); // 기본 최소값
  const actualHeight = Math.max(strokeWidth, 2); // 최소 2px 높이 보장

  // 컨테이너 스타일 계산
  const containerStyle: {
    width: DimensionValue;
    height: DimensionValue;
  } = {
    width: "100%", // 기본값
    height: strokeWidth + margin * 2, // 선 높이 + 상하 여백
  };

  return (
    <View style={containerStyle} onLayout={handleContainerLayout}>
      {/* Wiggle Line */}
      {actualWidth > 0 && actualHeight > 0 && (
        <Svg
          width={actualWidth + margin * 2}
          height={actualHeight + margin * 2}
          viewBox={`0 0 ${actualWidth + margin * 2} ${actualHeight + margin * 2}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Path
            d={path}
            stroke={getColor(strokeColor)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(${margin}, ${margin})`}
          />
        </Svg>
      )}
    </View>
  );
};

export default WiggleDivider;
