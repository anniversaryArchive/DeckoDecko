import { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import Icon from "./Icon";

interface IChip {
  label: string;
  color?: keyof typeof chipTheme.color;
  size?: keyof typeof chipTheme.size;
  value?: string;
  onClick?: (value?: string) => void;
  onDelete?: (value?: string) => void;
  className?: string;
  rounded?: boolean;
  bold?: boolean;
}

const chipTheme = {
  color: {
    primary: { bg: "bg-primary", text: "text-secondary-light" },
    "secondary-light": { bg: "bg-secondary-light", text: "text-secondary-dark" },
  },
  size: {
    sm: { bg: "px-1.5 py-1", text: "text-tag" },
    md: { bg: "px-2 py-1.5", text: "text-body2" },
    lg: { bg: "px-3 py-2", text: "text-body1" },
  },
};

const Chip = (props: IChip) => {
  const {
    label,
    size = "md",
    color = "secondary-light",
    value,
    onClick,
    onDelete,
    className = "",
    rounded = false,
    bold = true,
  } = props;

  const handleClick = useCallback(() => {
    if (onClick) onClick(value || label);
  }, [onClick, value, label]);

  const handleDelete = useCallback(() => {
    if (onDelete) onDelete(value || label);
  }, [onDelete, value, label]);

  return (
    <View
      className={`w-fit flex justify-center items-center ${rounded ? "rounded-full" : "rounded-2xl"} ${chipTheme.color[color].bg} ${chipTheme.size[size].bg} ${onDelete ? "flex-row gap-2" : ""} ${className}`}
    >
      <Pressable onPress={handleClick} disabled={!onClick}>
        <Text
          className={`${chipTheme.size[size].text} ${chipTheme.color[color].text} ${bold ? "font-DunggeunmisoB" : "font-Dunggeunmiso"} `}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
      {onDelete && (
        <Pressable onPress={handleDelete}>
          <Icon name="close" stroke={"#AAAAAA"} fill={"#AAAAAA"} size={size === "sm" ? 10 : 14} />
        </Pressable>
      )}
    </View>
  );
};

export default Chip;
