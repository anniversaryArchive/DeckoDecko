import { useCallback, useEffect, useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { Button, Typography, SearchBox, Chip } from "@components/index";
import SimpleSwiper from "@components/SimpleSwiper";
import * as searchHistory from "@utils/searchHistory";
import * as supaBase from "@utils/supabase";
import { IGachaItem } from "@/types/search";

export default function Index() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(""); // 검색어 상태 추가
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentGoods, setRecentGoods] = useState<IGachaItem[]>([]);
  const [popularGoods, setPopularGoods] = useState<IGachaItem[]>([]);

  const loadSearches = useCallback(async () => {
    const searches = await searchHistory.getRecentSearches();
    setRecentSearches(searches);
  }, []);

  const loadRecentGoods = useCallback(async () => {
    const goods = await searchHistory.getRecentGoods();
    setRecentGoods(goods);
  }, []);

  const loadPopularGoods = useCallback(async () => {
    const goods = await supaBase.getPopularGoods();
    setPopularGoods(goods);
  }, []);

  const handleSearch = async (value: string) => {
    await searchHistory.addRecentSearch(value);
    await loadSearches();

    router.push({
      pathname: "/Search/search-results",
      params: { searchTerm: value }
    });
  };

  const handleRemoveSearches = async (value: string) => {
    await searchHistory.removeRecentSearch(value);
    await loadSearches();
  };

  const handleClearRecentGoods = () => {
    Alert.alert("최근 본 굿즈를 전체 삭제하시겠습니까?", '', [
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
    Alert.alert("최근 검색어를 전체 삭제하시겠습니까?", '', [
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

  useEffect(() => {
    loadSearches();
    loadRecentGoods();
    loadPopularGoods();
  }, [loadSearches, loadRecentGoods, loadPopularGoods]);

  return (
    <View className="flex-1 bg-white">
      <View className="ml-2 mr-2">
        <SearchBox
          className="h-16"
          value={searchValue}
          onChangeText={setSearchValue}
          onSubmit={handleSearch}
        />
      </View>

      {/* 최근 검색어 */}
      <View className="mt-4 mb-4">
        <View className="flex flex-row justify-between items-center mb-2 ml-4 mr-4">
          <Typography variant="Header4">최근 검색어</Typography>
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
                  onClick={() => handleSearch(term)}
                  onDelete={() => handleRemoveSearches(term)}
                  className={isLast ? "mr-4" : ""}
                />
              );
            })}
          </ScrollView>
        ) : (
          <View className="items-center justify-center h-11">
            <Typography variant="Body2" color="secondary-dark">
              최근 검색어가 없습니다.
            </Typography>
          </View>
        )}
      </View>

      {/* 최근 본 굿즈 */}
      <View className="mt-4 mb-4">
        <View className="flex flex-row justify-between items-center mb-2 ml-4 mr-4">
          <Typography variant="Header4">최근 본 굿즈</Typography>
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
            data={recentGoods}
            slidesPerView={2.5}
            itemSpacing={12}
            onSlidePress={(item) => console.log("선택한 굿즈:", item)}
          />
        ) : (
          <View className="items-center justify-center h-11 ml-4 mr-4">
            <Typography variant="Body2" color="secondary-dark">
              최근 본 굿즈가 없습니다.
            </Typography>
          </View>
        )}
      </View>

      {/* 인기 굿즈 */}
      <View className="mt-4 mb-4">
        <View className="flex flex-row justify-between items-center mb-2 ml-4 mr-4">
          <Typography variant="Header4">인기 굿즈</Typography>
        </View>
        {popularGoods.length > 0 ? (
          <SimpleSwiper
            data={popularGoods}
            slidesPerView={2.5}
            itemSpacing={12}
            onSlidePress={(item) => console.log("선택한 인기 굿즈:", item)}
          />
        ) : (
          <View className="items-center justify-center h-11 ml-4 mr-4">
            <Typography variant="Body2" color="secondary-dark">
              인기 굿즈가 없습니다.
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
}
