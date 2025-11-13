import { TextInput, TextInputProps } from "react-native";
import { colors } from "@utils/tailwind-colors";
import { inputTheme } from "./InputBox";

export interface ITextBoxProps extends TextInputProps {
  placeholder?: string;
  className?: string;
  onSubmit?: (value: string) => void;
  color?: keyof typeof inputTheme.color;
  bold?: boolean;
  readOnly?: boolean;
  [options: string]: any;
}

const TextBox = (props: ITextBoxProps) => {
  const {
    placeholder,
    onSubmit,
    className,
    color = "secondary-dark",
    bold = false,
    readOnly,
    ...options
  } = props;

  const defaultProps = `${bold ? "font-DunggeunmisoB" : "font-Dunggeunmiso"} border p-2 rounded text-[15px] text-secondary-dark ${inputTheme.color[color]} min-h-[60px] ${className}`;
  const readOnlyProps = `bg-gray-200`;

  return (
    <TextInput
      multiline
      numberOfLines={6}
      onSubmitEditing={(e) => {
        const value = e.nativeEvent.text;
        onSubmit && onSubmit(value);
      }}
      clearButtonMode="while-editing"
      placeholder={placeholder}
      placeholderTextColor={colors.secondary["dark-80"]}
      className={`${defaultProps} ${readOnly && readOnlyProps}`}
      {...options}
    />
  );
};

export default TextBox;
