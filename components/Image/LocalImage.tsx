import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";

import NoImage from "./NoImage";

interface ILocalImageProps {
  assetId?: string;
  width?: number;
  height?: number;
}

const LocalImage = (props: ILocalImageProps) => {
  const { assetId, width = 155, height = 155 } = props;
  const [imageUri, setImageUri] = useState<string>();

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!assetId) return;

        const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);

        if (assetInfo) {
          setImageUri(assetInfo.localUri);
        } else {
          // 로컬 디비에 저장되어있는 assetId 삭제
          // Alert.alert("이미지를 불러올 수 없습니다", "사진첩에서 이미지가 삭제된 것 같아요!", [
          //   {
          //     text: "확인",
          //     onPress: async () => {
          //       await images.deleteByAssetId(assetId);
          //     },
          //   },
          // ]);
        }
      } catch (error) {
        console.error("미디어 라이브러리에서 에러 발생:", error);
        setImageUri(undefined);
      }
    };

    loadImage();
  }, [assetId]);

  return (
    <>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width, height }} />
      ) : (
        <NoImage width={width} height={height} />
      )}
    </>
  );
};

export default LocalImage;
