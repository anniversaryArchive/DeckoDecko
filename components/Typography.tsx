import { PixelRatio, Text, View } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";
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
}

interface ITwoToneTypography {
  variant?: keyof typeof typographyTheme.variant;
  color?: never;
  twotone?: keyof typeof twotoneColorMap;
  className?: never;
  children: React.ReactNode;
  numberOfLines?: number;
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

const Typography = (props: ITypography | ITwoToneTypography) => {
  const {
    variant = "body1",
    color = "secondary-dark",
    twotone,
    children,
    className = "",
    numberOfLines = 1,
  } = props;

  const getTwotoneTypography = (twotone: keyof typeof twotoneColorMap) => {
    const regex = /\d+(\.\d+)?/g;

    const [scale, _] = fontSize[variant];
    const remValue = scale.match(regex);

    const responsiveFontSize = BASE_FONT_SIZE * Number(remValue);

    const strokeWidth: number = variant === "header1" ? 2 : 1.5;
    return (
      <Svg height={responsiveFontSize + strokeWidth} width="100%">
        <SvgText
          fill={twotoneColorMap[twotone].fill} // 텍스트 내부 색상
          stroke={twotoneColorMap[twotone].stroke} // 외곽선 색상
          strokeWidth={strokeWidth} // 외곽선 두께
          fontSize={responsiveFontSize} // 폰트 크기
          x={0}
          y={responsiveFontSize / 2 + strokeWidth}
          fontFamily={"DunggeunmisoB"}
          alignmentBaseline="middle"
        >
          {children}
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
          numberOfLines={numberOfLines === 0 ? undefined : (numberOfLines ?? 1)}
          maxFontSizeMultiplier={1.5}
          ellipsizeMode="tail"
          style={{ flexShrink: 1, overflow: "hidden" }}
        >
          {children}
        </Text>
      )}
    </View>
  );
};

export default Typography;
