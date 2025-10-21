import { View, Image, Pressable } from "react-native";
import Typography from "./Typography";
import WiggleBorder from "./WiggleBorder";
import Button from "./Button";

type GoodsThumbnailProps = {
  nameKr: string;
  animeTitle?: string | null | undefined;
  imageLink?: string;
  onPress?: () => void; // 클릭 이벤트 추가
};

const GoodsThumbnail = ({ nameKr, animeTitle, imageLink, onPress }: GoodsThumbnailProps) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      className="relative w-[155px] mb-2"
    >
    {/* 이미지 영역 */}
      <View className="w-[155px] h-[155px]">
        <WiggleBorder width={155} height={155} />
        {imageLink && (
          <Image
            source={{ uri: imageLink }}
            className="w-[145px] h-[145px] absolute top-[5px] left-[5px] rounded-[10px]"
            resizeMode="cover"
          />
        )}
      </View>

      {/* 텍스트 영역 */}
      <View className="max-w-[150px] overflow-hidden flex gap-1 pl-1 mt-[10px]">
        <Button
          layout="flex"
          rounded
          onPress={() => {}}
          pointerEvents="none" // ✅ 부모 Pressable이 클릭을 받도록
        >
          {animeTitle ? animeTitle : "기타"}
        </Button>

        <Typography
          variant="Body4"
          color="primary"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{
            flexShrink: 1,
            minHeight: 16,
            textBreakStrategy: "simple",
          }}
        >
          {nameKr}
        </Typography>
      </View>
    </Pressable>
  );
};

export default GoodsThumbnail;
