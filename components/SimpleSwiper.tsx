import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import GoodsThumbnail from "./GoodsThumbnail";
import {IGachaItem} from '@/types/search';

interface SimpleSwiperProps {
  data: IGachaItem[];
  onSlidePress?: (item: IGachaItem, index: number) => void;
  slidesPerView?: number; // 한 화면에 보여질 아이템 수
  itemSpacing?: number; // 카드 간 간격
}

export default function SimpleSwiper({
  data,
  onSlidePress,
  slidesPerView = 2.5,
  itemSpacing = 10,
}: SimpleSwiperProps) {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setScreenWidth(window.width);
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const itemWidth = screenWidth / slidesPerView;

  const renderItem = ({ item, index }: ListRenderItemInfo<IGachaItem>) => {
    const isFirst = index === 0;
    const isLast = index === data.length - 1;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSlidePress?.(item, index)}
        style={{
          width: itemWidth,
          marginLeft: isFirst ? 16 : itemSpacing / 2,  // 첫 슬라이드 왼쪽 margin 16
          marginRight: isLast ? 16 : itemSpacing / 2,   // 마지막 슬라이드 오른쪽 margin 16
        }}
        className="rounded-lg"
      >
        <GoodsThumbnail nameKr={item.name_kr} animeTitle={item.anime_kr_title} imageLink={item.image_link} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="w-full">
      <FlatList
        ref={flatListRef}
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + itemSpacing / 2}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
    </View>
  );
}
