import React, { useEffect, useState, useMemo } from "react";
import { View, LayoutChangeEvent, DimensionValue } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/utils/tailwind-colors";

interface IWiggleBorderProps {
  width?: number | string; // default. 100%
  height?: number; // default. children min-height
  children?: React.ReactNode;

  margin?: number; // border 바깥쪽 여백 (default. 4)

  backgroundColor?: string; // tailwind color key (e.g. "primary", "primary.light") 또는 hex color
  strokeColor?: string; // tailwind color key (e.g. "primary", "primary.light") 또는 hex color
  strokeWidth?: number; // default. 2
  frequency?: number; // 얼마나 자주 흔들릴지 (0-100, default 100)
  wiggle?: number; // 진폭 (0-100, default 30)
  smoothen?: number; // 보간 부드러움 정도 (0-100, default 50)
}

const WiggleBorder: React.FC<IWiggleBorderProps> = ({
  width,
  height,
  children,
  strokeColor = "primary",
  strokeWidth = 2,
  frequency = 100,
  wiggle = 30,
  smoothen = 50,
  margin = 4,
  backgroundColor,
}) => {
  const [path, setPath] = useState<string>("");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [childrenSize, setChildrenSize] = useState({ width: 0, height: 0 });

  const getColor = (color: string): string => {
    // hex color인 경우
    if (color.startsWith("#")) return color;

    // tailwind color
    const colorPath = color.split(".");
    const mainColor = colorPath[0] as keyof typeof colors;
    const subColor = colorPath[1];

    const colorObj = colors[mainColor];

    if (!colorObj) return colors.primary.DEFAULT;

    // 서브 컬러를 지정한 경우
    if (subColor && typeof colorObj === "object" && subColor in colorObj) {
      return colorObj[subColor as keyof typeof colorObj];
    }

    // 메인 컬러를 지정했거나, 서브 컬러를 지정했으나 해당 컬러가 없는 경우
    return typeof colorObj === "object" && "DEFAULT" in colorObj
      ? colorObj.DEFAULT
      : typeof colorObj === "string"
        ? colorObj
        : colors.primary.DEFAULT;
  };

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
      const maxDeviation = (wiggleAmount / 100) * 8;

      // smoothen 높을수록 더 부드러운 곡선을 그려준다.
      const smoothnessFactor = smoothenAmount / 100;

      // 상단 가장자리
      for (let x = 0; x <= w; x += segmentLength) {
        const actualX = Math.min(x, w);
        const deviation = (seededRandom(seedCounter++) - 0.5) * maxDeviation;
        points.push({ x: actualX, y: deviation });
      }

      // 우측 가장자리
      for (let y = segmentLength; y <= h; y += segmentLength) {
        const actualY = Math.min(y, h);
        const deviation = (seededRandom(seedCounter++) - 0.5) * maxDeviation;
        points.push({ x: w + deviation, y: actualY });
      }

      // 하단 가장자리 (우측에서 좌측으로)
      for (let x = w - segmentLength; x >= 0; x -= segmentLength) {
        const actualX = Math.max(x, 0);
        const deviation = (seededRandom(seedCounter++) - 0.5) * maxDeviation;
        points.push({ x: actualX, y: h + deviation });
      }

      // 좌측 가장자리 (하단에서 상단으로)
      for (let y = h - segmentLength; y > 0; y -= segmentLength) {
        const actualY = Math.max(y, 0);
        const deviation = (seededRandom(seedCounter++) - 0.5) * maxDeviation;
        points.push({ x: deviation, y: actualY });
      }

      // smoothen 적용을 위한 베지어 곡선 생성
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

        // 마지막 점에서 첫 번째 점으로 연결
        const first = points[0];
        const last = points[points.length - 1];
        const secondLast = points[points.length - 2];

        const tension = smoothnessFactor * 0.3;
        const cp1x = last.x + (first.x - secondLast.x) * tension;
        const cp1y = last.y + (first.y - secondLast.y) * tension;

        pathString += ` Q ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
      } else {
        // 직선으로 연결
        for (let i = 1; i < points.length; i++) {
          pathString += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
        }
        pathString += " Z";
      }

      return pathString;
    };

    // 실제 렌더링에 사용할 크기 계산 (여백을 뺀 실제 border 영역)
    const actualWidth =
      typeof width === "number"
        ? width - margin * 2
        : containerSize.width > 0
          ? containerSize.width - margin * 2
          : 300 - margin * 2;

    const actualHeight =
      height !== undefined
        ? height - margin * 2
        : childrenSize.height > 0
          ? childrenSize.height
          : children
            ? 50 // children이 있지만 아직 측정되지 않은 경우 임시 높이
            : 10; // children이 없는 경우 최소 높이

    return generatePath(actualWidth, actualHeight, frequency, wiggle, smoothen);
  }, [width, height, frequency, wiggle, smoothen, containerSize, childrenSize, children, margin]);

  useEffect(() => {
    setPath(memoizedPath);
  }, [memoizedPath]);

  // container 크기 계산
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setContainerSize({ width: layoutWidth, height: layoutHeight });
  };

  // children 크기 계산
  const handleChildrenLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    // children 크기가 변경된 경우에만, 사이즈를 업데이트 해줌
    if (
      Math.abs(childrenSize.width - layoutWidth) > 0.5 ||
      Math.abs(childrenSize.height - layoutHeight) > 0.5
    )
      setChildrenSize({ width: layoutWidth, height: layoutHeight });
  };

  // 실제 렌더링에 사용할 크기 계산 (여백을 뺀 실제 border 영역)
  const actualWidth =
    typeof width === "number"
      ? width - margin * 2
      : containerSize.width > 0
        ? containerSize.width - margin * 2
        : 300 - margin * 2; // 기본 최소값

  const actualHeight =
    height !== undefined ? height - margin * 2 : childrenSize.height > 0 ? childrenSize.height : 30; // 기본 최소값

  // 컨테이너 스타일 계산
  const containerStyle: {
    width: DimensionValue;
    height: DimensionValue;
  } = {
    width:
      typeof width === "string"
        ? (width as DimensionValue) // 'n%' 형태의 값도 가능
        : typeof width === "number"
          ? width
          : "100%", // 기본 최소값
    height:
      height !== undefined
        ? height
        : childrenSize.height > 0
          ? childrenSize.height + margin * 2
          : 10 + margin * 2, // 기본 최소값
  };

  return (
    <View style={containerStyle} onLayout={handleContainerLayout}>
      <View
        style={{
          width: typeof width === "number" ? width - margin * 2 : "auto",
          height: height ? height - margin * 2 : "auto",
          margin: margin,
          justifyContent: "center",
          alignItems: "center",
          flex: width === undefined ? 1 : undefined,
          backgroundColor: backgroundColor ? getColor(backgroundColor) : "transparent",
        }}
      >
        {/* height가 고정되지 않은 경우, children 변화 감지를 위한 래퍼로 감싸줌 */}
        {height === undefined ? <View onLayout={handleChildrenLayout}>{children}</View> : children}
      </View>

      {/* Wiggle border */}
      {actualWidth > 0 && actualHeight > 0 && (
        <Svg
          width="100%"
          height="100%"
          className="absolute"
          viewBox={`0 0 ${actualWidth + margin * 2} ${actualHeight + margin * 2}`}
          preserveAspectRatio="none"
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

export default WiggleBorder;
