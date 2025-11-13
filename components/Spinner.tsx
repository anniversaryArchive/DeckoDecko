import { View, ActivityIndicator } from 'react-native';
import { colors } from "@utils/tailwind-colors";

type SpinnerProps = {
  visible: boolean;
  size?: 'small' | 'large';
  color?: string;
};

export function Spinner({ visible = true, size = 'large', color = colors.primary.DEFAULT }: SpinnerProps) {
  if (!visible) return null;
  return (
    <View className="absolute inset-0 bg-[#FFFFFF80] items-center justify-center z-50">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

export default Spinner;
