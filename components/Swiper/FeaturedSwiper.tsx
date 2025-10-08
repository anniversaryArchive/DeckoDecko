import React, { useState, useEffect } from "react";
import {
  Dimensions,
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

import { WiggleBorder } from "@/components";

interface SlideItem {
  id: number;
  imageUrl?: string;
}

interface FeaturedSwiperProps {
  data: SlideItem[];
  title: string;
  loop?: boolean;
  width?: number;
  offset?: number;
  onSlidePress?: (item: SlideItem, index: number) => void;
}

export default function FeaturedSwiper({
  data,
  title,
  loop = false,
  width,
  offset,
  onSlidePress,
}: FeaturedSwiperProps) {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setScreenWidth(window.width);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => {
      subscription.remove();
    };
  }, []);

  let slideWidth = screenWidth * 0.45;
  let parallaxOffset = 90;

  if (screenWidth <= 810) {
    slideWidth = screenWidth * 0.7;
    parallaxOffset = 60;
  }
  if (screenWidth <= 480) {
    slideWidth = screenWidth * 0.85;
    parallaxOffset = 40;
  }

  if (width) slideWidth = width;
  if (offset) parallaxOffset = offset;

  const slideHeight = 250;
  const progress = useSharedValue<number>(0);

  const renderItem = ({ item, index }: { item: SlideItem; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (onSlidePress) {
          onSlidePress(item, index);
        }
      }}
      style={[styles.slide, { width: slideWidth, height: slideHeight }]}
    >
      <WiggleBorder height={slideHeight} borderZIndex={3}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.empty} />
        )}
      </WiggleBorder>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { overflow: 'visible' }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Carousel
        loop={loop}
        width={slideWidth}
        height={slideHeight}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={2000}
        renderItem={renderItem}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: parallaxOffset,
        }}
        onProgressChange={progress}
        pagingEnabled={true}
        snapEnabled={true}
        style={[
          Platform.OS === 'web'
            ? { alignSelf: 'center', marginHorizontal: 0, overflow: 'visible' }
            : { marginHorizontal: 0, overflow: 'visible' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#998372',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 15,
    fontFamily: 'DunggeunmisoB',
  },
  slide: { overflow: "hidden", justifyContent: "flex-end" },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  empty: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
