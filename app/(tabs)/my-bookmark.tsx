import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, View } from "react-native";

import { Button, Chip, Icon, InputBox, Segment, Typography, WiggleBorder } from "@components/index";
import { supabase } from "@utils/supabase";
import { colors } from "@utils/tailwind-colors";
import { BOOKMARK_TYPE } from "@/constants/global";
import folder from "@table/folders";
import items from "@table/items";

import { TFolder } from "@/types/folder";
import { TBookmarkType } from "@/types/bookmark";
import { TItem } from "@/types/item";

// 임의로 선언한 타입입니다
type TGacha = {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  name_kr: string;
  image_link: string;
  anime_id?: number;
  price: number;
};

// conflict 날 것 같아서 임의로 선언한 컴포넌트입니당
// 추후 소정씨가 작업한 걸로 대체할 예정입니당
const GoodsThumbnail = ({ image, folderName, name, gachaName }: any) => {
  return (
    <View className="flex gap-[10px] w-44">
      <WiggleBorder width={155} height={155}>
        <Image source={{ uri: image }} className="w-full h-full" />
      </WiggleBorder>
      <View className="flex gap-2">
        <View className="flex flex-row items-center gap-2">
          <Chip size="sm" label={folderName} />
          <Typography variant="Body4" color="primary">
            {name}
          </Typography>
        </View>
        <Typography variant="Caption2">{gachaName}</Typography>
      </View>
    </View>
  );
};

export default function MyBookmark() {
  const [bookmarkType, setBookmarkType] = useState<TBookmarkType>("WISH");
  const [viewMode, setViewMode] = useState<"folder" | "item">("item");
  const [folderList, setFolderList] = useState<Map<number, TFolder>>();
  const [selectedFolder, setSelectedFolder] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemList, setItemList] = useState<
    Array<TItem & { folderName: string; gachaInfo: TGacha }>
  >([]);

  const loadBookmarkItems = async () => {
    const itemList =
      selectedFolder === 0 ? await items.getAll() : await items.getAllByFolderId(selectedFolder);
    const filteredItemList = itemList.filter((i) => i.type === bookmarkType);

    const ids = filteredItemList.map((i) => i.gacha_id);

    const { data: gachaData, error: supabaseError } = await supabase
      .from("gacha")
      .select("*")
      .in("id", ids);

    if (supabaseError) {
      throw supabaseError; // 에러가 발생하면 catch 블록으로 던지기
    }

    const gachaDataMap = new Map(gachaData.map((gacha) => [gacha.id, gacha]));

    const mergedList = filteredItemList.map((item) => {
      const gachaInfo = gachaDataMap.get(item.gacha_id);
      const folderInfo = folderList!.get(item.folder_id);

      return { ...item, folderName: folderInfo?.name as string, gachaInfo };
    });

    setItemList(mergedList);
  };

  useEffect(() => {
    const loadFolderList = async () => {
      const folderList = await folder.getAll();
      setFolderList(
        new Map(
          [{ id: 0, name: "전체", created_at: new Date() }, ...folderList].map((folder) => [
            folder.id,
            folder,
          ])
        )
      );
    };

    loadFolderList();
  }, []);

  useEffect(() => {
    if (folderList) loadBookmarkItems();
  }, [selectedFolder, bookmarkType, folderList]);

  useEffect(() => {
    setSearchTerm("");
    setViewMode("item");
    setSelectedFolder(0);
  }, [bookmarkType]);

  return (
    <View className="flex-1 gap-4 px-6 pt-1">
      {/* Header */}
      <View className="flex flex-row items-center justify-between">
        <Typography variant="Header1" color="primary">
          LOGO
        </Typography>
        <Pressable>
          <Icon name="search" size={32} fill={colors.primary.DEFAULT} />
        </Pressable>
      </View>

      <Segment segments={BOOKMARK_TYPE} selectedKey={bookmarkType} onSelect={setBookmarkType} />
      <View className="flex-1 gap-4">
        {/* 폴더 리스트 */}
        <ScrollView
          horizontal
          className="min-h-8 flex-none -mx-6"
          contentContainerClassName="flex gap-3 flex-row pl-6"
          showsHorizontalScrollIndicator={false}
        >
          {folderList &&
            Array.from(folderList).map(([id, { name }]) => {
              const isSelected = id === selectedFolder;

              return (
                <Button
                  key={`folder_` + id}
                  bold
                  variant={isSelected ? "contained" : "outlined"}
                  onPress={() => {
                    setSelectedFolder(id);
                  }}
                >
                  {name}
                </Button>
              );
            })}
        </ScrollView>
        <InputBox size="md" color="secondary" value={searchTerm} onChangeText={setSearchTerm} />

        {/* WISH | GET */}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-end gap-1">
            <Button
              bold
              variant="text"
              color={viewMode === "folder" ? "primary" : "secondary-dark"}
              contentClassName={viewMode === "folder" ? "" : "text-secondary-dark-80"}
              onPress={() => {
                setViewMode("folder");
              }}
            >
              폴더 보기
            </Button>
            <Button
              variant="text"
              bold
              color={viewMode === "item" ? "primary" : "secondary-dark"}
              contentClassName={viewMode === "item" ? "" : "text-secondary-dark-80"}
              onPress={() => {
                setViewMode("item");
              }}
            >
              아이템 보기
            </Button>
          </View>
          <FlatList
            data={itemList}
            extraData={selectedFolder}
            contentContainerClassName="pb-4 flex gap-2 justify-center"
            columnWrapperClassName="flex flex-row items-center justify-between p-2"
            numColumns={2}
            keyExtractor={(item) => `${item.id}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const { gachaInfo } = item;

              return (
                <GoodsThumbnail
                  name={item.name}
                  folderName={item.folderName}
                  gachaName={gachaInfo.name_kr}
                  image={item.thumbnail || gachaInfo.image_link}
                />
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}
