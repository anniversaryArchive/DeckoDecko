import { View, Image } from "react-native";
import Typography from "./Typography";
import WiggleBorder from "./WiggleBorder";
import Button from "./Button";

type GoodsThumbnailProps = {
  nameKr: string;
  animeTitle?: string | null | undefined;
  imageLink?: string;
};

const GoodsThumbnail = ({ nameKr, animeTitle, imageLink }: GoodsThumbnailProps) => {
  return (
    <View className="flex gap-[10px] relative">
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
      <View className="max-w-[150px] overflow-hidden flex gap-1 pl-1">
        <Button
          layout="flex"
          rounded
          onPress={() => {}}>
          {animeTitle ? animeTitle : '기타'}
        </Button>
        <Typography
          variant="Body4"
          color="primary"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ flexShrink: 1, minHeight: 16, textBreakStrategy: "simple" }}
        >
          {nameKr}
        </Typography>
      </View>
    </View>
  );
};

export default GoodsThumbnail;
