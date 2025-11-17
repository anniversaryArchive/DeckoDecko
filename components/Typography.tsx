import { PixelRatio, Text, View, StyleProp, TextStyle, useWindowDimensions } from "react-native";
import Svg, { Text as SvgText, TSpan } from "react-native-svg";
import { splitTextIntoLines } from "@utils/splitTextIntoLines";
import { colors } from "@utils/tailwind-colors";
import { fontSize } from "@utils/tailwind-fontSize";

interface IBaseTypographyProps {
  children: React.ReactNode;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  style?: StyleProp<TextStyle>;
}

interface IStandardTypographyProps extends IBaseTypographyProps {
  variant?: keyof typeof typographyTheme.variant;
  color?: keyof typeof typographyTheme.color;
  twotone?: never;
  className?: string;
}

interface ITwoToneTypographyProps extends IBaseTypographyProps {
  variant?: "header1" | "header2" | "header3";
  color?: never;
  twotone: keyof typeof twotoneColorMap;
  className?: never;
}

export const typographyTheme = {
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
    "gray-04": "text-gray-03",
    "gray-05": "text-gray-05",
  },
};

const twotoneColorMap = {
  primary: {
    fill: colors.primary.light,
    stroke: colors.primary.DEFAULT,
  },
};

const Typography = (props: IStandardTypographyProps | ITwoToneTypographyProps) => {
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
  const { width } = useWindowDimensions();

  const getTwotoneTypography = (twotone: keyof typeof twotoneColorMap) => {
    const text = children?.toString();
    if (!text) return;

    const [scale, _] = fontSize[variant];
    const remValue = scale.match(/\d+(\.\d+)?/g);

    const deviceFontSize = 16 * PixelRatio.getFontScale();
    const responsiveFontSize = deviceFontSize * Number(remValue);

    const lines = splitTextIntoLines(text, width, responsiveFontSize);
    const lineHeight = responsiveFontSize * 1.2;

    const stroke = () => {
      switch (variant) {
        case "header1":
          return 2;
        case "header3":
          return 1.2;
        default:
          return 1.5;
      }
    };

    return (
      <Svg height={lineHeight * lines.length} width="100%">
        <SvgText
          fill={twotoneColorMap[twotone].fill} // 텍스트 내부 색상
          stroke={twotoneColorMap[twotone].stroke} // 외곽선 색상
          strokeWidth={stroke()} // 외곽선 두께
          fontSize={responsiveFontSize} // 폰트 크기
          fontFamily={"DunggeunmisoB"}
          alignmentBaseline="middle"
        >
          {lines.map((line: string, index: number) => {
            return (
              <TSpan key={`lines-${index}`} x={0} dy={index === 0 ? lineHeight / 2 : lineHeight}>
                {line}
              </TSpan>
            );
          })}
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
