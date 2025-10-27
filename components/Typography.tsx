import { PixelRatio, Text, View, StyleProp, TextStyle } from "react-native";
import Svg, { Text as SvgText, TSpan } from "react-native-svg";
import { colors } from "@utils/tailwind-colors";
import { fontSize } from "@utils/tailwind-fontSize";

interface ITypography {
  variant?: keyof typeof typographyTheme.variant;
  color?: keyof typeof typographyTheme.color;
  twotone?: never;
  className?: string;
  children: React.ReactNode;
  numberOfLines?: number; // 추가: 한 줄 제한
  ellipsizeMode?: "head" | "middle" | "tail" | "clip"; // 추가: 말줄임표 위치
  style?: StyleProp<TextStyle>; // 새로 추가된 style prop
}

interface ITwoToneTypography {
  variant?: keyof typeof typographyTheme.variant;
  color?: never;
  twotone?: keyof typeof twotoneColorMap;
  className?: never;
  children: React.ReactNode;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip"; // 추가: 말줄임표 위치
  style?: StyleProp<TextStyle>; // 새로 추가된 style prop
}

const BASE_FONT_SIZE = 16 * PixelRatio.getFontScale();

const typographyTheme = {
  variant: {
    header1: "text-header1 font-DunggeunmisoB",
    header2: "text-header2 font-DunggeunmisoB",
    header3: "text-header3 font-DunggeunmisoB",
    header4: "text-header4 font-Dunggeunmiso",
    header5: "text-header5 font-DunggeunmisoB",
    title1: "text-title1 font-Dunggeunmiso",
    body1: "text-body1 font-Dunggeunmiso",
    body2: "text-body2 font-Dunggeunmiso",
    body3: "text-body3 font-DunggeunmisoB",
    body4: "text-body4 font-Dunggeunmiso",
    footnote: "text-footnote font-Dunggeunmiso",
    caption1: "text-caption1 font-Dunggeunmiso",
    caption2: "text-caption2 font-DunggeunmisoB",
    tag: "text-tag font-DunggeunmisoB",
  },
  color: {
    primary: "text-primary",
    "primary-light": "text-primary-light",
    secondary: "text-secondary",
    "secondary-light": "text-secondary-light",
    "secondary-dark": "text-secondary-dark",
    black: "text-black",
    "gray-05": "text-gray-05",
  },
};

const twotoneColorMap = {
  primary: {
    fill: colors.primary.light,
    stroke: colors.primary.DEFAULT,
  },
};

function splitTextByLength(text: string, limit = 12) {
  // 1. 문자열을 공백 기준으로 단어 배열로 나눕니다.
  const words = text.split(" ");

  let currentLength = 0;
  let splitIndex = -1; // 두 번째 줄이 시작될 단어의 인덱스

  // 2. 단어를 하나씩 순회하며 길이를 검사합니다.
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // 3. 현재 길이에 (공백 + 단어) 길이를 더해봅니다.
    //    (첫 단어가 아닐 때만 공백 길이 1을 추가)
    const newLength = currentLength + word.length + (i > 0 ? 1 : 0);

    // 4. 만약 더한 길이가 12를 "초과"하면,
    if (newLength > limit) {
      // 현재 단어(i)가 두 번째 줄의 시작이 됩니다.
      splitIndex = i;
      break; // 루프 중단
    }

    // 5. 12를 넘지 않으면, 현재 길이를 갱신하고 계속 진행합니다.
    currentLength = newLength;
  }

  // 6. 분리 지점(splitIndex)을 기준으로 두 줄로 나눕니다.

  if (splitIndex === -1) {
    // 12를 넘지 않아 분리되지 않은 경우
    return [text, ""];
  }

  // (예외 처리: 만약 첫 단어부터 12자를 넘으면 line1은 비어있게 됩니다.)
  const line1 = words.slice(0, splitIndex).join(" ");
  const line2 = words.slice(splitIndex).join(" ");

  return [line1, line2];
}

const Typography = (props: ITypography | ITwoToneTypography) => {
  const {
    variant = "body1",
    color = "secondary-dark",
    twotone,
    children,
    className = "",
    numberOfLines = 1,
    ellipsizeMode = "tail",
    style, // 새로 추가된 style prop 받기
  } = props;

  const getTwotoneTypography = (twotone: keyof typeof twotoneColorMap) => {
    const text = children?.toString();
    if (!text) return;

    const regex = /\d+(\.\d+)?/g;

    const [scale, _] = fontSize[variant];
    const remValue = scale.match(regex);

    const lineHeight = BASE_FONT_SIZE * Number(remValue) * 1.2;
    const strokeWidth: number = variant === "header1" ? 2 : 1.5;

    const [line1, line2] = splitTextByLength(text);
    const isMultipleLine = !!line2;

    const svgHeight = isMultipleLine ? lineHeight * 2 + strokeWidth : lineHeight + strokeWidth;
    const firstLineY = lineHeight / 2 + strokeWidth / 2;

    return (
      <Svg height={svgHeight} width="100%">
        <SvgText
          fill={twotoneColorMap[twotone].fill} // 텍스트 내부 색상
          stroke={twotoneColorMap[twotone].stroke} // 외곽선 색상
          strokeWidth={strokeWidth} // 외곽선 두께
          fontSize={lineHeight} // 폰트 크기
          fontFamily={"DunggeunmisoB"}
          alignmentBaseline="middle"
        >
          <TSpan x={0} y={firstLineY}>
            {line1}
          </TSpan>
          {isMultipleLine && (
            <TSpan x={0} dy={lineHeight}>
              {line2}
            </TSpan>
          )}
        </SvgText>
      </Svg>
    );
  };

  return (
    <View>
      {twotone ? (
        <>{getTwotoneTypography(twotone)}</>
      ) : (
        <Text
          className={`${typographyTheme.variant[variant]} ${typographyTheme.color[color]} ${className}`}
          numberOfLines={numberOfLines}
          maxFontSizeMultiplier={1.5}
          ellipsizeMode={ellipsizeMode}
          style={[{ flexShrink: 1, overflow: "hidden" }, style]} // 새로 추가된 style 병합 적용
        >
          {children}
        </Text>
      )}
    </View>
  );
};

export default Typography;
