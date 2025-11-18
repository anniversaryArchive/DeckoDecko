import { useCallback, useEffect, useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@utils/supabase";
import * as searchHistory from "@utils/searchHistory";

import { IGachaItem } from "@/types/search";
import { Button, Typography, SearchBox, Chip, SimpleSwiper, Spinner } from "@components/index";

export default function Index() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentGoods, setRecentGoods] = useState<IGachaItem[]>([]);
  const [popularGoods, setPopularGoods] = useState<IGachaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSearches = useCallback(async () => {
    const searches = await searchHistory.getRecentSearches();
    setRecentSearches(searches);
  }, []);

  const loadRecentGoods = useCallback(async () => {
    const goods = await searchHistory.getRecentGoods();
    setRecentGoods(goods);
  }, []);

  const loadPopularGoods = useCallback(async () => {
    try {
      const { data: topGachaIds, error: countError } = await supabase.rpc("get_top_gacha_views");
      if (countError) throw countError;

      const gachaIds = topGachaIds.map((d) => d.gacha_id);

      const { data, error } = await supabase
        .from("gacha")
        .select(
          `
        id,
        name,
        name_kr,
        image_link,
        anime_id,
        price,
        anime:anime_id (
          kr_title
        )
      `
        )
        .in("id", gachaIds);

      if (error) throw error;

      const goods = gachaIds.map((id) => data.find((item) => item.id === id));

      setPopularGoods(goods);
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
    console.log("handleNavigateToDetail");
    router.push(`/detail/${id}`);
  };

  useEffect(() => {
    loadSearches();
    loadRecentGoods();
    loadPopularGoods();
  }, [loadSearches, loadRecentGoods, loadPopularGoods]);

  return (
    <View className="flex-1 bg-white">
      <Spinner visible={loading} />
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

      {/* 최근 본 굿즈 */}
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
            data={recentGoods}
            slidesPerView={2.5}
            itemSpacing={12}
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

      {/* 인기 굿즈 */}
      <View className="mt-4 mb-4">
        <View className="flex flex-row items-center justify-between mb-2 ml-4 mr-4">
          <Typography variant="header4">인기 굿즈</Typography>
        </View>
        {popularGoods.length > 0 ? (
          <SimpleSwiper
            data={popularGoods}
            slidesPerView={2.5}
            itemSpacing={12}
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
