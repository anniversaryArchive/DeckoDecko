import { useCallback, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import {
  Button,
  GoodsThumbnail,
  Header,
  Icon,
  InputBox,
  Segment,
  Typography,
  Spinner,
} from "@components/index";
import { supabase } from "@utils/supabase";
import { BOOKMARK_TYPE } from "@/constants/global";
import folder from "@table/folders";
import items from "@table/items";
import { TBookmarkType, TItemExtended } from "@/types/bookmark";
import { TFolder } from "@/types/folder";

export default function MyBookmark() {
  const [bookmarkType, setBookmarkType] = useState<TBookmarkType>("WISH");
  const [viewMode, setViewMode] = useState<"folder" | "item">("item");
  const [folderList, setFolderList] = useState<Map<number, TFolder>>();
  const [selectedFolder, setSelectedFolder] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemList, setItemList] = useState<TItemExtended[]>([]);
  const [loading, setLoading] = useState(false);

  // 폴더 리스트
  const loadFolderList = async () => {
    const folderData = await folder.getAll();
    setFolderList(
      new Map(
        [{ id: 0, name: "전체", sequence: 0, created_at: new Date() }, ...folderData].map((f) => [
          f.id,
          f,
        ])
      )
    );
  };

  // 아이템 리스트
  const loadBookmarkItems = async () => {
    setLoading(true);
    try {
      const folders = folderList ?? new Map<number, TFolder>();
      const itemsData =
        selectedFolder === 0
          ? await items.getAll()
          : await items.getItemsByFolderId(selectedFolder);
      const filtered = itemsData.filter((i) => i.type === bookmarkType);

      const ids = filtered.map((i) => i.gacha_id);
      const { data: gachaData, error } = await supabase
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
        .in("id", ids);
      if (error) throw error;

      const gachaMap = new Map(gachaData.map((g) => [g.id, g]));
      const mergedList = filtered.map((item) => {
        const gachaInfo = gachaMap.get(item.gacha_id);
        const folderInfo = folders.get(item.folder_id);
        return { ...item, folderName: folderInfo?.name ?? "기타", gachaInfo: gachaInfo! };
      });

      setItemList(mergedList);
    } finally {
      setLoading(false);
    }
  };

  // 묶어보기: 동일 gacha_id로 그룹핑, 아이템 개수 추가
  const getFolderViewData = (): TItemExtended[] => {
    const map = new Map<number, { folderName: string; items: TItemExtended[]; count: number }>();

    itemList.forEach((item) => {
      const key = item.gacha_id;
      if (!map.has(key)) {
        map.set(key, { folderName: item.folderName ?? "기타", items: [], count: 0 });
      }
      const group = map.get(key)!;
      group.items.push(item);
      group.count++;
    });

    return Array.from(map.values()).map((group) => ({
      ...group.items[0],
      folderName: group.folderName,
      count: group.count,
      gachaInfo: group.items[0].gachaInfo,
    }));
  };

  // 필터링 처리
  const filteredItemList = itemList.filter(
    (item) =>
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

  const isBundle = viewMode === "folder";
  const flatListData = isBundle ? filteredFolderViewData : filteredItemList;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 gap-4 px-6 pt-1">
      <Spinner visible={loading} />
      {/* Header */}
      <Header />

      {/* WISH / GET */}
      <Segment
        segments={BOOKMARK_TYPE}
        selectedKey={bookmarkType}
        onSelect={(key) => {
          setBookmarkType(key);
          setSelectedFolder(0); // 선택 폴더를 "전체"로 옮기기
        }}
      />

      <View className="flex-1 gap-4">
        {/* 폴더 리스트 */}
        <View className="flex-row items-center justify-between gap-2">
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

          <Pressable
            className="bg-primary-light w-9 h-9 flex items-center justify-center rounded-full"
            onPress={() => {
              router.push("/(tabs)/bookmark/folder-manage");
            }}
          >
            <Icon name="folderFill" size={20} />
          </Pressable>
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
                <View>
                  <GoodsThumbnail
                    redirectId={item.gachaInfo.id}
                    name={isBundle ? item.gachaInfo.name_kr : item.name}
                    category={item.folderName}
                    itemName={item.gachaInfo.name_kr}
                    image={
                      isBundle
                        ? item.gachaInfo.image_link
                        : item.thumbnail || item.gachaInfo.image_link
                    }
                  />
                  {isBundle && item.count !== undefined && (
                    <Typography variant="body2" color="primary" className="pl-1">
                      아이템 {item.count}개
                    </Typography>
                  )}
                </View>
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
    </SafeAreaView>
  );
}
