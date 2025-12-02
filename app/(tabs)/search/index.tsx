import React, { useRef, useState, useCallback } from "react";
import { View, FlatList, ScrollView, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { supabase } from "@utils/supabase";
import * as searchHistory from "@utils/searchHistory";

import { Button, Typography, SearchBox, Chip, Spinner, SimpleSwiper } from "@components/index";
import type { IGachaItem } from "@/types/search";

export default function Index() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentGoods, setRecentGoods] = useState<IGachaItem[]>([]);
  const [popularGoods, setPopularGoods] = useState<IGachaItem[]>([]);

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

      // 직접 받은 데이터 그대로 셋팅, map(find) 제거
      // gachaIds는 필요한 경우 참고용으로 남김
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

      const goods: IGachaItem[] = data ?? [];

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
    await Promise.all([loadSearches(), loadRecentGoods(), loadPopularGoods()]);
  }, [loadSearches, loadRecentGoods, loadPopularGoods]);

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
      <Spinner visible={false} />
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
    </View>
  );
}