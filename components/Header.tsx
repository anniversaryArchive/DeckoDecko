import { Pressable, View, Image, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import Typography from "./Typography";
import Icon from "./Icon";
import { colors } from "@utils/tailwind-colors";

import TitleLogo from '@/assets/title_logo.png';

const Header = ({ horizontalGap = false }) => {
  const goToSearch = () => {
    router.push("/(tabs)/search");
  };

  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = 100;
  const logoHeight = (logoWidth / 910) * 500;

  return (
    <View className={`flex flex-row items-center justify-between ${horizontalGap ? "px-6" : ""}`}>
      <Image
        source={TitleLogo}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
      />
      <Pressable onPress={goToSearch}>
        <Icon name="bigHeadSearch" size={24} fill={colors.primary.DEFAULT} />
      </Pressable>
    </View>
  );
};

export default Header;
