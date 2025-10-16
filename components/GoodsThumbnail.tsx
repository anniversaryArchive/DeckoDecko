import { View, Image } from "react-native";
import Typography from "./Typography";
import WiggleBorder from "./WiggleBorder";

interface GoodsThumbnailProps {
  title: string;
  subtitle: string;
  imgUrl?: string;
}

const GoodsThumbnail = ({ title, subtitle, imgUrl }: GoodsThumbnailProps) => {
  return (
    <View className="flex gap-[10px] relative">
      <View className="w-[155px] h-[155px]">
        <WiggleBorder width={155} height={155} />
        {imgUrl && (
          <Image
            source={{ uri: imgUrl }}
            className="w-[145px] h-[145px] absolute top-[5px] left-[5px] rounded-[10px]"
            resizeMode="cover"
          />
        )}
      </View>
      {/* 텍스트 영역 */}
      <View className="max-w-[150px] overflow-hidden flex gap-1">
        <View className="flex flex-row items-center gap-2">
          <Typography variant="body3" color="primary" numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Typography>
        </View>
        <View className="max-w-[150px] overflow-hidden">
          <Typography variant="body3" numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Typography>
        </View>
      </View>
    </View>
  );
};

export default GoodsThumbnail;
