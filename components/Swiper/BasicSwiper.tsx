import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, ScaledSize, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';

// 제네릭 타입 정의
interface BasicSwiperProps<T extends { image?: any }> {
  data: T[];
  onSlidePress?: (index: number, item: T) => void;
  renderItem?: (item: T, index: number) => React.ReactNode;
}

export default function BasicSwiper<T extends { image?: any }>({ data, onSlidePress, renderItem }: BasicSwiperProps<T>) {
  const carouselRef = useRef<ICarouselInstance | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowSize, setWindowSize] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setWindowSize(window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  const onProgressChange = (_: number, absoluteProgress: number) => {
    setCurrentIndex(Math.round(absoluteProgress));
  };

  const goToIndex = (index: number) => {
    carouselRef.current?.scrollTo({ index, animated: true });
    setCurrentIndex(index);
  };

  const carouselHeight = windowSize.height * 0.4;

  // 데이터가 1개일 때 루프 비활성화
  const shouldLoop = data.length > 1;

  const defaultRenderItem = (item: T, index: number) => {
    const hasImage = item.image;

    if (hasImage) {
      return (
        <Image
          source={item.image}
          style={{ width: '100%', height: '100%', borderRadius: 12 }}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.fallbackCard}>
        <Text style={styles.slideText}>{`Slide ${String(item)}`}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {data.length === 1 ? (
        // 데이터가 1개일 때는 Carousel 없이 단일 카드만 렌더링
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, { height: carouselHeight }]}
          onPress={() => onSlidePress?.(0, data[0])}
        >
          {renderItem ? renderItem(data[0], 0) : defaultRenderItem(data[0], 0)}
        </TouchableOpacity>
      ) : (
        // 데이터가 2개 이상일 때 Carousel 렌더링
        <Carousel
          ref={carouselRef}
          width={windowSize.width}
          height={carouselHeight}
          data={data}
          loop={shouldLoop}
          onProgressChange={onProgressChange}
          renderItem={({ index }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSlidePress?.(index, data[index])}
              style={[styles.card, { height: carouselHeight }]}
            >
              {renderItem
                ? renderItem(data[index], index)
                : defaultRenderItem(data[index], index)}
            </TouchableOpacity>
          )}
        />
      )}

      {/* 페이지네이션 (Pagination) - 데이터가 1개일 때는 숨김 */}
      {data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={{
                  borderRadius: 100,
                  width: 10,
                  height: 10,
                  backgroundColor: isActive ? '#FFBBC1' : '#D9D9D9',
                  marginRight: index !== data.length - 1 ? 10 : 0,
                }}
                onPress={() => goToIndex(index)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFBBC1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  fallbackCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  slideText: {
    fontSize: 24,
    color: '#998372',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});
