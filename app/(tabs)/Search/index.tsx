import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { View, Dimensions, FlatList, ListRenderItemInfo, Pressable, LayoutChangeEvent, ScrollView, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { supabase } from "@utils/supabase";
import * as searchHistory from "@utils/searchHistory";

import GoodsThumbnail from "@components/GoodsThumbnail";
import { Button, Typography, SearchBox, Chip, Spinner } from "@components/index";
import type { IGachaItem } from "@/types/search";

interface SimpleSwiperProps {
  data: IGachaItem[];
  onSlidePress?: (item: IGachaItem, index: number) => void;
  slidesPerView?: number;
  itemSpacing?: number;
  resetTrigger?: number;
  resetToIndex?: number;
}

const SimpleSwiper = React.memo(forwardRef<FlatList<any> | null, SimpleSwiperProps>(({
  data,
  onSlidePress,
  slidesPerView = 2.5,
  itemSpacing = 10,
  resetTrigger,
  resetToIndex = 0,
}, ref) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [hasLayout, setHasLayout] = useState(false);
  const [didInitScroll, setDidInitScroll] = useState(false);

  // useImperativeHandle(ref, () => flatListRef.current ?? null);
  useImperativeHandle(ref, () => flatListRef.current as FlatList<any>);

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setScreenWidth(window.width);
      setHasLayout(false);
      setDidInitScroll(false);
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription.remove();
  }, []);

  const itemWidth = screenWidth / slidesPerView;

  useEffect(() => {
    if (!hasLayout || resetTrigger == null || didInitScroll) return;

    const offset = resetToIndex * (itemWidth + itemSpacing);
    flatListRef.current?.scrollToOffset({
      offset,
      animated: false,
    });
    setDidInitScroll(true);
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
    setDidInitScroll(false);
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

export default function Index() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentGoods, setRecentGoods] = useState<IGachaItem[]>([]);
  const [popularGoods, setPopularGoods] = useState<IGachaItem[]>([]);

  const [loading, setLoading] = useState(true);

  const recentSwiperRef = useRef<FlatList<any> | null>(null);
  const popularSwiperRef = useRef<FlatList<any> | null>(null);

  const [recentResetIndex, setRecentResetIndex] = useState(0);
  const [popularResetIndex, setPopularResetIndex] = useState(0);

  const loadSearches = useCallback(async () => {
    const searches = await searchHistory.getRecentSearches();
    setRecentSearches(searches);
  }, []);

  const loadRecentGoods = useCallback(async () => {
    const goods = await searchHistory.getRecentGoods();
    setRecentGoods((prev) => {
      const isSame = JSON.stringify(prev) === JSON.stringify(goods);
      if (!isSame) setRecentResetIndex(s => s + 1);
      return goods;
    });
  }, []);

  const loadPopularGoods = useCallback(async () => {
    try {
      const { data: topGachaIds, error: countError } = await supabase.rpc("get_top_gacha_views");
      if (countError) throw countError;

      const gachaIds = topGachaIds.map((d) => d.gacha_id);

      const { data, error } = await supabase
        .from("gacha")
        .select(`
          id,
          name,
          name_kr,
          image_link,
          anime_id,
          price,
          anime:anime_id (
            kr_title
          )
        `)
        .in("id", gachaIds);

      if (error) throw error;

      const goods = gachaIds.map((id) => data.find((item) => item.id === id));
      setPopularGoods((prev) => {
        const isSame = JSON.stringify(prev) === JSON.stringify(goods);
        if (!isSame) setPopularResetIndex(s => s + 1);
        return goods;
      });
    } catch (e) {
      console.error("Error loading popular goods", e);
      setPopularGoods([]);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSearches(), loadRecentGoods(), loadPopularGoods()]);
    setLoading(false);
  }, [loadSearches, loadRecentGoods, loadPopularGoods]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSearch = async (value: string) => {
    await searchHistory.addRecentSearch(value);
    await loadSearches();
    router.push({
      pathname: "/search/search-results",
      params: { searchTerm: value },
    });
  };

  const handleRemoveSearches = async (value: string) => {
    await searchHistory.removeRecentSearch(value);
    await loadSearches();
  };

  const handleClearRecentGoods = () => {
    Alert.alert("최근 본 굿즈를 전체 삭제하시겠습니까?", "", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: async () => {
          try {
            await searchHistory.clearRecentGoods();
            setRecentGoods([]);
          } catch (error) {
            console.error("Error clearing recent goods", error);
          }
        },
      },
    ]);
  };

  const handleClearRecentSearches = () => {
    Alert.alert("최근 검색어를 전체 삭제하시겠습니까?", "", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: async () => {
          await searchHistory.clearRecentSearches();
          setRecentSearches([]);
        },
      },
    ]);
  };

  const handleNavigateToDetail = (id: number) => {
    router.push(`/detail/${id}`);
  };

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  return (
    <View className="flex-1 bg-white">
      <Spinner visible={loading} />
      {!loading && (
        <>
          <View className="ml-2 mr-2">
            <SearchBox
              className="h-16"
              value={searchValue}
              onChangeText={setSearchValue}
              onSubmit={handleSearch}
            />
          </View>

          <View className="mt-4 mb-4">
            <View className="flex flex-row items-center justify-between mb-2 ml-4 mr-4">
              <Typography variant="header4">최근 검색어</Typography>
              {recentSearches.length > 0 && (
                <Button
                  variant="text"
                  size="md"
                  color="secondary-dark"
                  onPress={handleClearRecentSearches}
                >
                  전체 삭제
                </Button>
              )}
            </View>
            {recentSearches.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 items-center min-h-11 ml-4"
              >
                {recentSearches.map((term, index) => {
                  const isLast = index === recentSearches.length - 1;
                  return (
                    <Chip
                      key={`${term}_${index}`}
                      size="lg"
                      color="secondary-light"
                      label={term}
                      rounded
                      bold={false}
                      onClick={() => handleSearch(term)}
                      onDelete={() => handleRemoveSearches(term)}
                      className={isLast ? "mr-4" : ""}
                    />
                  );
                })}
              </ScrollView>
            ) : (
              <View className="h-11 items-center justify-center">
                <Typography variant="body2" color="secondary-dark">
                  최근 검색어가 없습니다.
                </Typography>
              </View>
            )}
          </View>

          <View className="mt-4 mb-4">
            <View className="flex flex-row items-center justify-between mb-2 ml-4 mr-4">
              <Typography variant="header4">최근 본 굿즈</Typography>
              {recentGoods.length > 0 && (
                <Button
                  variant="text"
                  size="md"
                  color="secondary-dark"
                  onPress={handleClearRecentGoods}
                >
                  전체 삭제
                </Button>
              )}
            </View>
            {recentGoods.length > 0 ? (
              <SimpleSwiper
                ref={recentSwiperRef}
                data={recentGoods}
                slidesPerView={2.5}
                itemSpacing={12}
                resetTrigger={recentResetIndex}
                resetToIndex={0}
                onSlidePress={(item) => handleNavigateToDetail(item.id)}
              />
            ) : (
              <View className="h-11 items-center justify-center ml-4 mr-4">
                <Typography variant="body2" color="secondary-dark">
                  최근 본 굿즈가 없습니다.
                </Typography>
              </View>
            )}
          </View>

          <View className="mt-4 mb-4">
            <View className="flex flex-row items-center justify-between mb-2 ml-4 mr-4">
              <Typography variant="header4">인기 굿즈</Typography>
            </View>
            {popularGoods.length > 0 ? (
              <SimpleSwiper
                ref={popularSwiperRef}
                data={popularGoods}
                slidesPerView={2.5}
                itemSpacing={12}
                resetTrigger={popularResetIndex}
                resetToIndex={0}
                onSlidePress={(item) => handleNavigateToDetail(item.id)}
              />
            ) : (
              <View className="h-11 items-center justify-center ml-4 mr-4">
                <Typography variant="body2" color="secondary-dark">
                  인기 굿즈가 없습니다.
                </Typography>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
