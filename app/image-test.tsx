import { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";

import LocalImage from "@components/LocalImage";
import images from "@/services/table/images";
import { saveImage } from "@utils/mediaLibraryService";

export default function Index() {
  const [image, setImage] = useState<string>();
  const [prevImg, setPrevImg] = useState<string>();

  const pickImage = async () => {
    const imgAssetId = await saveImage();

    if (imgAssetId) {
      image && setPrevImg(image);
      setImage(imgAssetId);
    }
  };

  const loadPrevImage = async () => {
    const img = await images.getOne();

    if (img?.assetId) {
      setPrevImg(img.assetId);
    } else {
      console.log("이미지 불러오기 실패");
    }
  };

  useEffect(() => {
    loadPrevImage();
  }, []);

  return (
    <View className="flex-col items-center justify-center flex-1 gap-5">
      <Pressable onPress={pickImage}>
        <Text className="font-dunggeunmisoB text-primary text-3xl">사진첩 열기</Text>
      </Pressable>
      {image && (
        <View className="flex items-center justify-center">
          <Text className="font-dunggeunmiso text-secondary-dark text-2xl">선택된 사진</Text>
          <LocalImage assetId={image} />
        </View>
      )}
      <View className="flex items-center justify-center">
        <Text className="font-dunggeunmiso text-secondary-dark text-2xl">최근 사진</Text>
        <LocalImage assetId={prevImg} />
      </View>
    </View>
  );
}
