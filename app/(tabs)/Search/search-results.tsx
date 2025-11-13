import React, { useState, useEffect } from "react";
import { View, FlatList, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { SearchBox, Typography } from "@/components";
import GoodsThumbnail from "@/components/GoodsThumbnail";
import * as searchHistory from "@utils/searchHistory";
import type { IGachaItem } from "@/types/search";

const LIMIT = 10;

export default function SearchResults() {
  const { searchTerm } = useLocalSearchParams<{ searchTerm?: string }>();
  const [searchValue, setSearchValue] = useState<string>(searchTerm ?? "");
  const [data, setData] = useState<IGachaItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const numColumns = 2; // 필요한 컬럼 수 설정

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const result = await searchHistory.searchGachaAndAnimeByName(searchValue, LIMIT, offset);

      const newItems = result?.items ?? [];

      // hasMore 판단과 알림을 setData 바깥에서 처리
      if (newItems.length < LIMIT) {
        setHasMore(false);
        if (newItems.length === 0 && offset > 0) {
          Alert.alert("알림", "더 이상 데이터가 없습니다.");
        }
      }

      setData((prev) => {
        const prevIds = new Set(prev?.map((item) => item.id) ?? []);
        const filteredNewItems = newItems.filter((item) => !prevIds.has(item.id));
        return [...(prev ?? []), ...filteredNewItems];
      });

      setOffset((prev) => prev + newItems.length);
      setTotalCount(result?.totalCount ?? 0);
    } catch (e) {
      console.error("Load more error:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchValue(value);
    setOffset(0);

    try {
      const result = await searchHistory.searchGachaAndAnimeByName(value, LIMIT, 0);
      const items = result?.items ?? [];
      setData(items);
      setOffset(items.length);
      setTotalCount(result?.totalCount ?? 0);
      setHasMore((result?.totalCount ?? 0) > LIMIT);

      await searchHistory.addRecentSearch(value);
    } catch (e) {
      console.error("Search error:", e);
      setData([]);
      setOffset(0);
      setHasMore(false);
      setTotalCount(0);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);

  const renderItem = ({ item }: { item: IGachaItem }) => (
    <GoodsThumbnail
      redirectId={item.id}
      name={item.name_kr}
      itemName={item.name_kr}
      category={item.media_kr_title}
      image={item.image_link}
    />
  );

  return (
    <View className="flex-1 bg-white">
      <View className="ml-2 mr-2">
        <SearchBox
          className="h-16"
          onSubmit={handleSearch}
          value={searchValue}
          onChangeText={setSearchValue}
        />
      </View>

      <FlatList<IGachaItem>
        numColumns={numColumns}
        data={data}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: "space-between",
                paddingHorizontal: 30,
                marginTop: 10,
                marginBottom: 10,
              }
            : undefined
        }
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={() => (
          <View>
            <View className="flex-row items-center mt-2 mb-1 ml-4">
              <Typography variant="header4" color="secondary-dark" className="mr-1">
                검색 결과
              </Typography>
              <Typography variant="header4" color="primary">
                {totalCount}
              </Typography>
              <Typography variant="header4" color="secondary-dark" className="ml-1">
                개
              </Typography>
            </View>
            <View className="border-t border-[#D2D2D2] mt-2 mx-5" />
          </View>
        )}
        ListFooterComponent={() =>
          loadingMore ? (
            <View className="items-center px-5 py-4">
              <Typography variant="body2" color="secondary-dark">
                불러오는 중...
              </Typography>
            </View>
          ) : null
        }
        ListEmptyComponent={() =>
          !loadingMore ? (
            <View className="h-11 items-center justify-center mx-4">
              <Typography variant="body2" color="secondary-dark">
                검색 결과가 없습니다.
              </Typography>
            </View>
          ) : null
        }
      />
    </View>
  );
}
