import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@deckodecko/ui";

import { GachaThumb } from "./GachaThumb";

/** 히어로 이미지 높이 (위 safe area 제외) */
const HEIGHT = 300;
/** 아래 모서리. 시안 값 36 은 radius 토큰(sheet 28)보다 커서 이 컴포넌트 상수로 둔다. */
const BOTTOM_RADIUS = 36;

/** 상세 맨 위 큰 이미지. 상태 바 뒤까지 채우고 아래 모서리만 둥글다. */
export function GachaHero({ imageUrl }: { imageUrl: string | null }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        height: HEIGHT + insets.top,
        backgroundColor: colors.accentSoft,
        borderBottomLeftRadius: BOTTOM_RADIUS,
        borderBottomRightRadius: BOTTOM_RADIUS,
        overflow: "hidden",
      }}
    >
      <GachaThumb imageUrl={imageUrl} borderRadius={0} />
    </View>
  );
}
