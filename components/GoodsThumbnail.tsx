import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";

import Typography from "./Typography";
import WiggleBorder from "./WiggleBorder";
import Chip from "./Chip";
import { LocalImage } from "./Image";

type GoodsThumbnailProps = {
  category?: string | null;
  name?: string;
  itemName?: string;
  image?: string;
  isLocalImage?: boolean;
  redirectId?: number;
};

const GoodsThumbnail = ({
  image,
  redirectId,
  isLocalImage = false,
  category,
  itemName,
  name,
}: GoodsThumbnailProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!redirectId}
      onPress={() => redirectId && router.push(`/detail/${redirectId}`)}
      className="flex gap-[10px] relative"
    >
      <View className="w-[155px] h-[155px]">
        <WiggleBorder width={155} height={155}>
          {isLocalImage ? (
            <LocalImage assetId={image} width={145} height={145} />
          ) : (
            <Image source={{ uri: image }} style={{ width: 145, height: 145 }} />
          )}
        </WiggleBorder>
      </View>
      {/* 텍스트 영역 */}
      <View className="max-w-[150px] pl-1 flex gap-2">
        <View className="overflow-clip flex-row items-center gap-1">
          {/* 카테고리 (ex. 게임, 애니, 연예인 등등) */}
          <Chip label={category ? category : "기타"} size="sm" className="max-w-[70px]" />
          {/* 아이템 (저장한 상품명 혹은 카테고리 상세정보) */}
          <View className="flex-1">
            <Typography variant="header5" color="primary">
              {name}
            </Typography>
          </View>
        </View>
        {/* 상품명 (가챠명) */}
        <Typography variant="body3" color="primary">
          {itemName}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

export default GoodsThumbnail;
