import React from "react";
import { View, Pressable } from "react-native";
import Typography from "@components/Typography";

type TSegmentItem<T> = {
  key: T;
  label: string;
};

type TSegmentProps<T> = {
  segments: ReadonlyArray<TSegmentItem<T>>;
  selectedKey: T;
  onSelect: (selectedKey: T) => void;
};

export default function Segment<T>({ segments, selectedKey, onSelect }: TSegmentProps<T>) {
  return (
    <View className="flex-row h-12 rounded-[4px] border-2 border-primary overflow-hidden">
      {segments.map(({ key, label }, index) => {
        const isSelected = key === selectedKey;
        const isLast = index === segments.length - 1;

        // 스타일 변수 분리
        const [pressableBg, typoColor] = isSelected
          ? ["bg-primary", "primary-light"]
          : ["bg-primary-light", "primary"];

        return (
          <Pressable
            key={key as string}
            onPress={() => onSelect(key)}
            className={`flex-1 items-center justify-center ${pressableBg} ${
              !isLast ? "border-r-2 border-r-primary" : ""
            }`}
          >
            <Typography variant="header3" color={typoColor}>
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
