import { useScrollToTop } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, useWindowDimensions } from "react-native";

import type { Folder, Gacha, Item } from "@deckodecko/core";
import { gutter, space } from "@deckodecko/ui";

import { GoodsItemCard } from "@/components/GoodsItemCard";
import { useFolderNames } from "@/hooks/useFolderNames";
import { gachaName } from "@/lib/displayName";

/** 열 수 · 카드 사이 간격 */
const COLUMNS = 2;
const GAP = space[12];

type Props = {
  items: Item[];
  /** 가챠 id → 요약. 아직 못 받은 가챠는 카드의 가챠 이름 · 이미지가 빈다 */
  gachas: ReadonlyMap<string, Gacha>;
  folders: Folder[];
  onPressItem: (item: Item) => void;
};

/** 내 굿즈 풀어보기: 아이템 카드 2열. 누르면 onPressItem (수정 시트) */
export function GoodsItemGrid({ items, gachas, folders, onPressItem }: Props) {
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const folderNames = useFolderNames(folders);
  const cardWidth = (width - gutter * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const listRef = useRef<FlatList<Item>>(null);
  useScrollToTop(listRef);
  return (
    <FlatList
      ref={listRef}
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      renderItem={({ item }) => {
        const gacha = gachas.get(item.gachaId);
        return (
          <GoodsItemCard
            item={item}
            folder={folderNames.get(item.folderId) ?? null}
            gacha={gacha ? gachaName(gacha, i18n.language) : null}
            gachaImageUrl={gacha?.imageUrl ?? null}
            onPress={() => onPressItem(item)}
            style={{ width: cardWidth }}
          />
        );
      }}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: space[24], gap: GAP }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}
