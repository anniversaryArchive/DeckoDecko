import React, { useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";

import NoImage from "./NoImage";

interface ILocalImageProps {
  assetId?: string;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
}

const LocalImage = (props: ILocalImageProps) => {
  const { assetId, width = 155, height = 155 } = props;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!assetId) {
        setImageUri(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔄 Loading assetId:", assetId);

        const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);

        // uri 우선, localUri 대체
        const imageUri = assetInfo.uri || assetInfo.localUri;

        if (imageUri) {
          setImageUri(imageUri);
          console.log("Loaded:", imageUri.substring(0, 50) + "...");
        } else {
          console.warn("No URI found for:", assetId);
          setImageUri(null);
        }
      } catch (error) {
        console.error("MediaLibrary error:", error);
        setImageUri(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [assetId]);

  if (isLoading) {
    return (
      <View
        style={
          {
            width,
            height,
            backgroundColor: "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          } as ViewStyle
        }
      />
    );
  }

  return imageUri ? (
    <Image
      source={{ uri: imageUri }}
      style={{ width, height, borderRadius: 8 }}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  ) : (
    <NoImage width={width} height={height} />
  );
};

export default LocalImage;
