import React from "react";
import { View } from "react-native";
import { colors } from "@utils/tailwind-colors";
import Typography from "./Typography";
import Icon from "./Icon";

const NoImage = (props: { width: number; height: number }) => {
  const { width, height } = props;
  const isNeedBigSize = Math.max(width, height) > 200;

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
      <Typography variant={isNeedBigSize ? "Header3" : "Header5"} color={"gray-05"}>
        NO IMAGE
      </Typography>
    </View>
  );
};

export default NoImage;
