import { Alert, Linking } from "react-native";

const linkingSettingAlert = (title: string, content?: string) => {
  return Alert.alert(title, content, [
    {
      text: "취소",
      style: "cancel",
    },
    {
      text: "설정으로 이동",
      onPress: () => Linking.openSettings(),
    },
  ]);
};

export default linkingSettingAlert;
