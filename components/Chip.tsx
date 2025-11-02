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
}

const chipTheme = {
  color: {
    primary: { bg: "bg-primary", text: "text-secondary-light" },
    "secondary-light": { bg: "bg-secondary-light", text: "text-secondary-dark" },
  },
  size: {
    sm: { bg: "h-[21px] px-1 py-[5px] rounded-xl", text: "text-[10px] font-DunggeunmisoB" },
    md: { bg: "h-[27px] px-2 py-[6px] rounded-xl", text: "text-[14px] font-DunggeunmisoB" },
    lg: { bg: "h-[30px] px-3 py-2 rounded-full", text: "text-[14px] font-Dunggeunmiso" },
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
  } = props;

  const handleClick = useCallback(() => {
    if (onClick) onClick(value || label);
  }, [onClick, value, label]);

  const handleDelete = useCallback(() => {
    if (onDelete) onDelete(value || label);
  }, [onDelete, value, label]);

  return (
    <View
      className={`w-fit flex justify-center items-center ${chipTheme.color[color].bg} ${chipTheme.size[size].bg} ${onDelete ? "flex-row gap-2" : ""} ${className}`}
    >
      <Pressable onPress={handleClick} disabled={!onClick}>
        <Text className={`${chipTheme.size[size].text} ${chipTheme.color[color].text}`}>
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
