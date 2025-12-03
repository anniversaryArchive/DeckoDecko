import { useRef } from "react";
import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@utils/tailwind-colors";
import Icon from "@components/Icon";
import InputBox, { InputBoxHandle } from "./InputBox";

interface ISearchBoxProps {
  placeholder?: string;
  className?: string;
  color?: keyof typeof searchBoxTheme;
  onSubmit: (value: string) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  [options: string]: any;
}

const searchBoxTheme = {
  primary: colors.primary.DEFAULT,
  secondary: colors.secondary.DEFAULT,
  "secondary-dark": colors.secondary.dark,
};

const SearchBox = (props: ISearchBoxProps) => {
  const {
    placeholder,
    onSubmit,
    className,
    color = "primary",
    value,
    onChangeText,
    ...options
  } = props;
  const router = useRouter();
  const inputRef = useRef<InputBoxHandle>(null);

  const handleSubmit = () => {
    const searchTerm = value ?? "";

    if (!searchTerm.trim()) {
      return Alert.alert("공백은 입력할 수 없습니다.", undefined, [{ text: "확인" }]);
    }

    onSubmit(searchTerm);
  };

  return (
    <View className={`flex flex-row items-center justify-center gap-2 ${className}`}>
      <Pressable
        onPress={() => {
          router.back();
        }}
        disabled={!router.canGoBack()}
      >
        <Icon name="chevronLeft" size={20} fill={searchBoxTheme[color]} />
      </Pressable>
      <InputBox
        wiggleBorder
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        className="text-[16px]"
        color={color}
        {...options}
      />
      <Pressable onPress={handleSubmit}>
        <Icon
          name="bigHeadSearch"
          size={20}
          fill={searchBoxTheme[color]}
          stroke={searchBoxTheme[color]}
        />
      </Pressable>
    </View>
  );
};

export default SearchBox;
