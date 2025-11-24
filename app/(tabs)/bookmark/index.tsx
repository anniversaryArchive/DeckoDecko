import { useCallback, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useFocusEffect } from "expo-router";

import { Button, GoodsThumbnail, Icon, InputBox, Segment, Typography } from "@components/index";
import { supabase } from "@utils/supabase";
import { colors } from "@utils/tailwind-colors";
import { BOOKMARK_TYPE } from "@/constants/global";
import folder from "@table/folders";
import items from "@table/items";

import type { TGacha } from "@/types/gacha";
import type { TFolder } from "@/types/folder";
import type { TBookmarkType } from "@/types/bookmark";
import type { TItem } from "@/types/item";

export default function MyBookmark() {
  const [bookmarkType, setBookmarkType] = useState<TBookmarkType>("WISH");
  const [viewMode, setViewMode] = useState<"folder" | "item">("item");
  const [folderList, setFolderList] = useState<Map<number, TFolder>>();
  const [selectedFolder, setSelectedFolder] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemList, setItemList] = useState<Array<TItem & { folderName: string; gachaInfo: TGacha }>>([]);

  // 폴더 리스트
  const loadFolderList = async () => {
    const folderData = await folder.getAll();
    setFolderList(
      new Map(
        [{ id: 0, name: "전체", sequence: 0, created_at: new Date() }, ...folderData].map(
          (f) => [f.id, f]
        )
      )
    );
  };

  // 아이템 리스트
  const loadBookmarkItems = async () => {
    const folders = folderList ?? new Map<number, TFolder>();
    const itemsData =
      selectedFolder === 0 ? await items.getAll() : await items.getItemsByFolderId(selectedFolder);
    const filtered = itemsData.filter((i) => i.type === bookmarkType);

    const ids = filtered.map((i) => i.gacha_id);
    const { data: gachaData, error } = await supabase.from("gacha").select("*").in("id", ids);
    if (error) throw error;

    const gachaMap = new Map(gachaData.map((g) => [g.id, g]));
    const mergedList = filtered.map((item) => {
      const gachaInfo = gachaMap.get(item.gacha_id);
      const folderInfo = folders.get(item.folder_id);
      return { ...item, folderName: folderInfo?.name ?? "기타", gachaInfo };
    });

    setItemList(mergedList);
  };

  // 묶어보기: 동일 gacha_id로 그룹핑
  const getFolderViewData = () => {
    const map = new Map<
      number,
      { folderName: string; items: Array<TItem & { gachaInfo: TGacha }> }
      >();

    itemList.forEach((item) => {
      const key = item.gacha_id;
      if (!map.has(key)) {
        map.set(key, { folderName: item.folderName ?? "기타", items: [] });
      }
      map.get(key)!.items.push(item);
    });

    // 대표 1개만 FlatList에 쓸 수 있게 변환
    return Array.from(map.values()).map((group) => group.items[0]);
  };

  // 필터링 처리 : 검색어 포함 여부 체크
  const filteredItemList = itemList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.gachaInfo.name_kr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolderViewData = getFolderViewData().filter((item) =>
    item.gachaInfo.name_kr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useFocusEffect(
    useCallback(() => {
      setSearchTerm("");
      setViewMode("item");
      setSelectedFolder(0);
      loadFolderList();
    }, [bookmarkType])
  );

  useFocusEffect(
    useCallback(() => {
      loadBookmarkItems();
    }, [selectedFolder, bookmarkType])
  );

  // 보기 모드에 따라 필터된 리스트 선택
  const isBundle = viewMode === "folder";
  const flatListData = isBundle ? filteredFolderViewData : filteredItemList;

  return (
    <View className="flex-1 gap-4 px-6 pt-1">
      {/* Header */}
      <View className="flex flex-row items-center justify-between">
        <Typography variant="header1" color="primary">
          LOGO
        </Typography>
        <Pressable>
          <Icon name="search" size={32} fill={colors.primary.DEFAULT} />
        </Pressable>
      </View>

      {/* WISH / GET */}
      <Segment segments={BOOKMARK_TYPE} selectedKey={bookmarkType} onSelect={setBookmarkType} />

      <View className="flex-1 gap-4">
        {/* 폴더 리스트 */}
        <View className="flex-row items-center justify-between gap-2 mt-3">
          <FlatList
            horizontal
            data={folderList ? Array.from(folderList.values()) : []}
            keyExtractor={(folder) => `folder_${folder.id}`}
            renderItem={({ item }) => (
              <Button
                bold
                variant={item.id === selectedFolder ? "contained" : "outlined"}
                onPress={() => setSelectedFolder(item.id)}
              >
                {item.name}
              </Button>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", gap: 12 }}
          />
          <Link href="/bookmark/folder-manage" asChild>
            <Pressable className="bg-primary-light w-9 h-9 flex items-center justify-center rounded-full">
              <Icon name="folderFill" size={20} />
            </Pressable>
          </Link>
        </View>

        {/* 검색 입력 */}
        <InputBox
          size="md"
          color="secondary"
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="내 굿즈 리스트 검색"
        />

        {flatListData.length ? (
          <View className="flex-1 gap-1">
            {/* 보기 모드 버튼 */}
            <View className="flex-row items-center justify-end gap-1">
              <Button
                bold
                variant="text"
                color={viewMode === "folder" ? "primary" : "secondary-dark"}
                contentClassName={viewMode === "folder" ? "" : "text-secondary-dark-80"}
                onPress={() => setViewMode("folder")}
              >
                묶어보기
              </Button>
              <Button
                bold
                variant="text"
                color={viewMode === "item" ? "primary" : "secondary-dark"}
                contentClassName={viewMode === "item" ? "" : "text-secondary-dark-80"}
                onPress={() => setViewMode("item")}
              >
                풀어보기
              </Button>
            </View>

            <FlatList
              data={flatListData}
              key={isBundle ? "bundle" : "item"}
              numColumns={2}
              keyExtractor={(item) => (isBundle ? `bundle_${item.gacha_id}` : `${item.id}`)}
              columnWrapperClassName="flex flex-row items-center justify-between p-2"
              contentContainerClassName="pb-4"
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <GoodsThumbnail
                  redirectId={item.gachaInfo.id}
                  name={isBundle ? item.gachaInfo.name_kr : item.name}
                  category={item.folderName}
                  itemName={isBundle ? null : item.gachaInfo.name_kr}
                  image={isBundle ? item.gachaInfo.image_link : item.thumbnail || item.gachaInfo.image_link}
                />
              )}
            />
          </View>
        ) : (
          <SafeAreaView edges={["bottom"]} className="items-center justify-center flex-1 gap-5">
            <Icon name="gachaCapsule" size={80} fill={"gray-06"} />
            <View className="items-center justify-center gap-1">
              <Typography variant="header5" color="gray-05">
                저장된 가챠가 없어요
              </Typography>
              <Typography variant="title1" color="gray-05">
                갖고싶거나, 소장 중인 가챠를 저장해보세요.
              </Typography>
            </View>
          </SafeAreaView>
        )}
      </View>
    </View>
  );
}
