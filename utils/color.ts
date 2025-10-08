import { colors } from "@/utils/tailwind-colors";

export const getColor = (color?: string) => {
  if (!color) return colors.primary.DEFAULT;
  if (color === "none") return color;

  // hex color인 경우
  if (color.startsWith("#")) return color;

  const splitUnit = color.includes(".") ? "." : "-";

  // tailwind color
  const colorPath = color.split(splitUnit);
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
