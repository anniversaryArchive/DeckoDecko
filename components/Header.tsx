import {Image, Pressable, View} from "react-native";
import {router} from "expo-router";
import Icon from "./Icon";
import {colors} from "@utils/tailwind-colors";

import TitleLogo from '@/assets/title_logo.png';

const Header = ({ horizontalGap = false }) => {
  const logoWidth = 150;

  const goToSearch = () => {
    router.push("/(tabs)/search");
  };

  return (
    <View className={`flex flex-row items-center justify-between ${horizontalGap ? "px-6" : ""}`}>
      <Image
        source={TitleLogo}
        style={{ width: logoWidth, aspectRatio: 3 }}
        resizeMode="contain"
      />
      <Pressable onPress={goToSearch}>
        <Icon name="bigHeadSearch" size={24} fill={colors.primary.DEFAULT} />
      </Pressable>
    </View>
  );
};

export default Header;
