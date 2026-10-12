import React from "react";
import { View } from "react-native";
import { colors } from "@utils/tailwind-colors";
import Icon from "@components/Icon";
import Typography from "@components/Typography";

const NoImage = (props: { width: number | `${number}%`; height: number | `${number}%` }) => {
  const { width, height } = props;
  const isNeedBigSize =
    typeof width === "number" && typeof height === "number" ? Math.max(width, height) > 200 : false;

  return (
    <View
      style={{
        width,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Icon
        name="image"
        size={isNeedBigSize ? 32 : 28}
        fill="none"
        stroke={colors.gray["05"]}
        strokeWidth={3}
      />
      <Typography variant={isNeedBigSize ? "header3" : "header5"} color={"gray-05"}>
        NO IMAGE
      </Typography>
    </View>
  );
};

export default NoImage;
