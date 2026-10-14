import { View } from "react-native";

interface IDividerProps {
  className?: string;
  color?: keyof typeof dividerTheme.color;
  thick?: keyof typeof dividerTheme.thick;
}

const dividerTheme = {
  color: {
    primary: "bg-primary",
    "primary-light": "bg-primary-light",
    secondary: "bg-secondary",
    "secondary-light": "bg-secondary-light",
    "secondary-dark": "bg-secondary-dark",
    "gray-01": "bg-gray-01",
    "gray-02": "bg-gray-02",
    "gray-03": "bg-gray-03",
    "gray-04": "bg-gray-04",
    "gray-05": "bg-gray-05",
    "gray-06": "bg-gray-06",
    "gray-07": "bg-gray-07",
    "gray-08": "bg-gray-08",
    "gray-09": "bg-gray-09",
  },
  thick: {
    sm: "h-px",
    md: "h-[2px]",
    lg: "h-[3px]",
  },
};

const Divider = (props: IDividerProps) => {
  const { color = "gray-03", thick = "sm", className = "", ...restProps } = props;

  return (
    <View
      className={`${className} w-full ${dividerTheme.color[color]} ${dividerTheme.thick[thick]}`}
      {...restProps}
      role="separator"
    />
  );
};

export default Divider;
