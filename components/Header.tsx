import { Pressable, View } from "react-native";
import { router } from "expo-router";
import Typography from "./Typography";
import Icon from "./Icon";
import { colors } from "@utils/tailwind-colors";

const Header = ({ horizontalGap = false }) => {
  const goToSearch = () => {
    router.push("/(tabs)/search");
  };

  return (
    <View className={`flex flex-row items-center justify-between ${horizontalGap ? "px-6" : ""}`}>
      <Typography variant="header1" color="primary">
        LOGO
      </Typography>
      <Pressable onPress={goToSearch}>
        <Icon name="bigHeadSearch" size={24} fill={colors.primary.DEFAULT} />
      </Pressable>
    </View>
  );
};

export default Header;
