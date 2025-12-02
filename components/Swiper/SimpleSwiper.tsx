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
const SimpleSwiper = React.memo(forwardRef<FlatList, SimpleSwiperProps>(({
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
  // 초기 스크롤 실행 여부 상태 추가
  const [didInitScroll, setDidInitScroll] = useState(false);

  useImperativeHandle(ref, () => flatListRef.current as FlatList);

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setScreenWidth(window.width);
      setHasLayout(false);
      setDidInitScroll(false); // 화면 크기 변경 시 스크롤 상태 초기화
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription.remove();
  }, []);

  const itemWidth = screenWidth / slidesPerView;

  // 리셋 트리거 발동 시 특정 인덱스로 이동하는 로직
  useEffect(() => {
    // 레이아웃이 없거나, 트리거가 없거나, 이미 초기 스크롤을 했다면 실행하지 않음
    if (!hasLayout || resetTrigger == null || didInitScroll) return;

    const offset = resetToIndex * (itemWidth + itemSpacing);
    flatListRef.current?.scrollToOffset({
      offset,
      animated: false,
    });
    setDidInitScroll(true); // 스크롤 실행 완료 표시
  }, [resetTrigger, resetToIndex, itemWidth, hasLayout, itemSpacing, didInitScroll]);

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
    setDidInitScroll(false); // 레이아웃 변경 시 스크롤 상태 초기화 (필요에 따라 제거 가능)
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
}));

export default SimpleSwiper;