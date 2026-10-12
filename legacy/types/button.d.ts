import { buttonTheme } from "@components/Button";
import { PressableProps } from "react-native";

export type TButtonVariant = "contained" | "outlined" | "text";

export type TButtonBaseProps = {
  children?: React.ReactNode;
  color?: keyof typeof buttonTheme.color;
  size?: keyof typeof buttonTheme.size;
  variant?: TButtonVariant;
  rounded?: boolean;
  disabled?: boolean;
  bold?: boolean;
  layout?: "flex" | "block";
  className?: string;
  contentClassName?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  [props: string]: any;
} & Omit<PressableProps, "className">;

export type TButtonWidthProps =
  | {
      width: "full";
      textAlign?: "left" | "center" | "right";
    }
  | {
      width?: "auto";
      textAlign?: never;
    };

export type TButtonStyleSet = {
  container: string;
  text: string;
};

export type TButtonProps = TButtonBaseProps & TButtonWidthProps;
