import { forwardRef, useImperativeHandle, useRef } from "react";
import { TextInput, TextInputProps } from "react-native";
import { getColor } from "@utils/color";
import { colors } from "@utils/tailwind-colors";
import WiggleBorder from "@components/WiggleBorder";

interface IInputBoxProps extends TextInputProps {
  placeholder?: string;
  className?: string;
  onSubmit?: (value: string) => void;
  type?: string;
  size?: keyof typeof inputTheme.size;
  color?: keyof typeof inputTheme.color;
  wiggleBorder?: boolean;
  value?: string; // 추가됨
}

export interface InputBoxHandle {
  getValue: () => string;
  clear: () => void;
}

export const inputTheme = {
  color: {
    primary: "border-primary",
    secondary: "border-secondary",
    "secondary-dark": "border-secondary-dark",
  },
  size: {
    sm: "h-[36px] font-Dunggeunmiso",
    md: "h-[40px] text-[15px] font-Dunggeunmiso",
    lg: "h-[44px] text-[16px] font-DunggeunmisoB",
  },
};

const BorderComponent = ({
wiggleBorder,
borderColor,
children,
}: {
  wiggleBorder: boolean;
  borderColor: keyof typeof inputTheme.color;
  children: React.ReactNode;
}) => {
  return wiggleBorder ? (
    <WiggleBorder strokeWidth={1.5} strokeColor={getColor(borderColor)}>
      {children}
    </WiggleBorder>
  ) : (
    children
  );
};

const InputBox = forwardRef<InputBoxHandle, IInputBoxProps>((props, ref) => {
  const {
    placeholder,
    onSubmit,
    className,
    color = "secondary-dark",
    size = "sm",
    wiggleBorder = false,
    readOnly,
    onChangeText,
    value, // 추가됨
    ...options
  } = props;

  const inputRef = useRef<TextInput>(null);
  const textRef = useRef(value ?? ""); // 초기값 설정

  useImperativeHandle(ref, () => ({
    getValue: () => textRef.current,
    clear: () => {
      textRef.current = "";
      inputRef.current?.clear();
    },
  }));

  const handleChangeText = (newText: string) => {
    textRef.current = newText;
    if (onChangeText) {
      onChangeText(newText);
    }
  };

  const defaultProps = `p-3 rounded text-secondary-dark ${
    !wiggleBorder ? "border" : ""
  } ${inputTheme.color[color]} ${inputTheme.size[size]}`;
  const readOnlyProps = `bg-gray-200`;

  return (
    <BorderComponent wiggleBorder={wiggleBorder} borderColor={color}>
      <TextInput
        ref={inputRef}
        value={value} // controlled input 으로 수정
        onChangeText={handleChangeText}
        onSubmitEditing={(e) => {
          if (onSubmit) {
            onSubmit(e.nativeEvent.text);
          }
        }}
        submitBehavior={"blurAndSubmit"}
        placeholder={placeholder || "검색어를 입력하세요."}
        placeholderTextColor={colors.secondary["dark-80"]}
        className={`${defaultProps} ${readOnly ? readOnlyProps : ""} ${className}`}
        clearButtonMode="while-editing"
        editable={!readOnly}
        {...options}
      />
    </BorderComponent>
  );
});

export default InputBox;