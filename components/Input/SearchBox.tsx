import { useRef } from "react";
import { Alert, Pressable, View } from "react-native";
import { useNavigation } from "expo-router";
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
  const navigation = useNavigation();
  const inputRef = useRef<InputBoxHandle>(null);

  const handleSubmit = () => {
    const searchTerm = value ?? "";

    if (!searchTerm.trim()) {
      return Alert.alert("공백은 입력할 수 없습니다.", undefined, [{ text: "확인" }]);
    }

    onSubmit(searchTerm);
  };

  return (
    <View className={`flex flex-row w-full items-center gap-3 ${className}`}>
      <Pressable
        onPress={() => {
          navigation.goBack();
        }}
        disabled={!navigation.canGoBack()}
      >
        <Icon
          name="chevronLeft"
          size={24}
          fill={searchBoxTheme[color]}
          stroke={searchBoxTheme[color]}
        />
      </Pressable>
      <View className={`grow`}>
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
      </View>
      <Pressable onPress={handleSubmit}>
        <Icon
          name="search"
          size={24}
          fill={searchBoxTheme[color]}
          stroke={searchBoxTheme[color]}
        />
      </Pressable>
    </View>
  );
};

export default SearchBox;
