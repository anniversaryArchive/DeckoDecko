import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { View, Dimensions, FlatList, ListRenderItemInfo, Pressable, LayoutChangeEvent } from "react-native";
import GoodsThumbnail from "@components/GoodsThumbnail";
import type { IGachaItem } from "@/types/search";

interface SimpleSwiperProps {
  data: IGachaItem[];
  onSlidePress?: (item: IGachaItem, index: number) => void;
  slidesPerView?: number; // 한 화면에 보여질 아이템 수
  itemSpacing?: number; // 카드 간 간격 (아이템들 사이 간격)
  resetTrigger?: number; // 부모에서 변경될 때 초기화 트리거
  resetToIndex?: number; // 이동할 목표 인덱스
}

// ref 전달받아 내부 FlatList 인스턴스에 접근 가능
const SimpleSwiper = forwardRef<FlatList, SimpleSwiperProps>(({
  data,
  onSlidePress,
  slidesPerView = 2.5,
  itemSpacing = 10,
  resetTrigger,
  resetToIndex = 0,
}, ref) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const flatListRef = useRef<FlatList>(null);
  const [hasLayout, setHasLayout] = useState(false);

  useImperativeHandle(ref, () => flatListRef.current as FlatList);

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setScreenWidth(window.width);
      setHasLayout(false);
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription.remove();
  }, []);

  const itemWidth = screenWidth / slidesPerView;

  useEffect(() => {
    if (!hasLayout || resetTrigger == null) return;

    const offset = resetToIndex * (itemWidth + itemSpacing);
    flatListRef.current?.scrollToOffset({
      offset,
      animated: false,
    });
  }, [resetTrigger, resetToIndex, itemWidth, hasLayout, itemSpacing]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<IGachaItem>) => (
      <Pressable
        onPress={() => onSlidePress?.(item, index)}
        style={{
          width: itemWidth,
          marginLeft: itemSpacing / 2,
          marginRight: itemSpacing / 2,
        }}
        className="rounded-lg"
      >
        <GoodsThumbnail
          name={item.name_kr}
          itemName={item.name_kr}
          category={item.media_kr_title}
          image={item.image_link}
        />
      </Pressable>
    ),
    [itemWidth, itemSpacing, onSlidePress]
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    setHasLayout(true);
  };

  return (
    <View className="w-full" onLayout={handleLayout}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + itemSpacing}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: itemSpacing / 2 }}
      />
    </View>
  );
});

export default SimpleSwiper;
