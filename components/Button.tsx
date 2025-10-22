import React, { useMemo } from "react";
import { Pressable, Text } from "react-native";
import cn from "@utils/cn";
import type { TButtonVariant, TButtonStyleSet, TButtonProps } from "@/types/button";

export const buttonTheme = {
  color: {
    primary: {
      contained: {
        DEFAULT: {
          container: "bg-primary border-primary border",
          text: "text-secondary-light",
        },
        bold: {
          container: "bg-primary border-primary border-2",
          text: "text-secondary-light",
        },
      },
      outlined: {
        DEFAULT: {
          container: "border-primary border",
          text: "text-primary",
        },
        bold: {
          container: "border-primary border-2",
          text: "text-primary",
        },
      },
      text: { container: "border-0", text: "text-primary" },
      disabled: { container: "bg-gray-300 border-gray-300 border", text: "text-primary-light-80" },
    },
    secondary: {
      contained: {
        DEFAULT: {
          container: "bg-secondary border-secondary border",
          text: "text-secondary-light",
        },
        bold: {
          container: "bg-secondary border-secondary border-2",
          text: "text-secondary-light",
        },
      },
      outlined: {
        DEFAULT: {
          container: "border-secondary border",
          text: "text-secondary",
        },
        bold: {
          container: "border-secondary border-2",
          text: "text-secondary",
        },
      },
      text: { container: "border-0", text: "text-secondary" },
      disabled: {
        container: "bg-gray-300 border-gray-300 border",
        text: "text-secondary-light-80",
      },
    },
    "secondary-dark": {
      contained: {
        DEFAULT: {
          container: "bg-secondary-light border-secondary-light border",
          text: "text-secondary-dark",
        },
        bold: {
          container: "bg-secondary-light border-secondary-light border-2",
          text: "text-secondary-dark",
        },
      },
      outlined: {
        DEFAULT: {
          container: "border-secondary-dark border",
          text: "text-secondary-dark",
        },
        bold: {
          container: "border-secondary-dark border-2",
          text: "text-secondary-dark",
        },
      },
      text: { container: "border-0", text: "text-secondary-dark" },
      disabled: {
        container: "bg-gray-300 border-gray-300 border",
        text: "text-secondary-dark-80",
      },
    },
  },
  size: {
    sm: { container: "py-1.5 px-3", text: "text-[14px]" },
    md: { container: "py-2 px-4", text: "text-[15px]" },
    lg: { container: "py-2.5 px-5", text: "text-[16px]" },
    xl: { container: "py-3 px-6", text: "text-[17px]" },
  },
  align: {
    left: "w-full text-left justify-start",
    center: "text-center justify-center",
    right: "w-full text-right justify-end",
  },
};

const getButtonStyles = (props: {
  color: keyof typeof buttonTheme.color;
  variant: TButtonVariant;
  disabled: boolean;
  bold: boolean;
}): TButtonStyleSet => {
  const { color, variant, disabled, bold } = props;
  const colorSet = buttonTheme.color[color];

  if (disabled) {
    return colorSet.disabled;
  }

  const variantSet = colorSet[variant];

  // Text
  if ("container" in variantSet) {
    return variantSet as TButtonStyleSet;
  }

  if (bold && "bold" in variantSet) {
    return variantSet.bold;
  }

  if ("DEFAULT" in variantSet) {
    return variantSet.DEFAULT;
  }

  return variantSet;
};

const Button = (props: TButtonProps) => {
  const {
    color = "primary",
    width = "auto",
    size = "sm",
    variant = "contained",
    layout = "block",
    rounded,
    disabled = false,
    bold = false,
    children,
    className,
    contentClassName,
    textAlign = "center",
    startIcon,
    endIcon,
    ...options
  } = props;

  const classes = useMemo(() => {
    const { container: colorContainerClass, text: colorTextClass } = getButtonStyles({
      color,
      variant,
      disabled,
      bold,
    });
    const hasIcon = !!(startIcon || endIcon);
    const fullWidthProps = layout === "block" ? "w-full" : "grow";
    const fitWidthProps = layout === "block" ? "w-fit" : "self-start";

    const container = cn(
      "flex items-center whitespace-nowrap select-none",
      hasIcon ? "flex-row justify-between gap-3" : "justify-center",
      rounded ? "rounded-full" : "rounded",
      width === "full" ? fullWidthProps : fitWidthProps,
      buttonTheme.size[size].container,
      colorContainerClass,
      className
    );

    const text = cn(
      bold ? "font-DunggeunmisoB" : "font-Dunggeunmiso",
      hasIcon ? "grow" : buttonTheme.align[textAlign],
      buttonTheme.size[size].text,
      colorTextClass,
      contentClassName
    );

    return { container, text };
  }, [
    color,
    variant,
    disabled,
    bold,
    size,
    width,
    textAlign,
    rounded,
    className,
    contentClassName,
  ]);

  return (
    <Pressable className={`${classes.container}`} disabled={disabled} {...options}>
      {startIcon && startIcon}
      {children && <Text className={`${classes.text}`}>{children}</Text>}
      {endIcon && endIcon}
    </Pressable>
  );
};
export default Button;
