import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";

import type { Folder, Gacha, Item, ItemType } from "@deckodecko/core";
import { gutter, space } from "@deckodecko/ui";

import { GoodsGachaRow } from "@/components/GoodsGachaRow";
import { useFolderNames } from "@/hooks/useFolderNames";
import { countByFolder, groupByGacha } from "@/lib/goods";
import { openGacha } from "@/lib/routes";

type Props = {
  items: Item[];
  /** 지금 보고 있는 종류. 개수 배지의 색 */
  type: ItemType;
  gachas: ReadonlyMap<string, Gacha>;
  /** 가챠 정보를 받았는지. 받기 전에는 gachas 에 없는 가챠를 "정보가 없는 가챠"로 보지 않는다 */
  gachasLoaded: boolean;
  folders: Folder[];
};

/** 내 굿즈 묶어보기: 가챠별 한 줄 (최근에 기록한 가챠부터). 누르면 상세 */
export function GoodsGachaList({ items, type, gachas, gachasLoaded, folders }: Props) {
  const { t } = useTranslation();
  const folderNames = useFolderNames(folders);
  const groups = useMemo(() => groupByGacha(items), [items]);
  // 폴더 분포는 폴더 목록 순서로: "기본 폴더 1, 별의 숲 2". 폴더가 하나면 이름만
  function folderSummary(list: Item[]) {
    const counts = countByFolder(list);
    const parts = folders
      .filter((f) => counts.has(f.id))
      .map((f) => ({ name: folderNames.get(f.id) ?? "", count: counts.get(f.id) ?? 0 }));
    if (parts.length === 1) return parts[0]!.name;
    return parts.map((p) => t("goods.folderCount", p)).join(", ");
  }
  return (
    <FlatList
      data={groups}
      keyExtractor={(group) => group.gachaId}
      renderItem={({ item: group }) => (
        <GoodsGachaRow
          gacha={gachas.get(group.gachaId) ?? null}
          fallbackName={gachasLoaded ? t("goods.unknownGacha") : ""}
          type={type}
          countLabel={t("goods.groupCount", { count: group.items.length })}
          folders={folderSummary(group.items)}
          onPress={() => openGacha(group.gachaId)}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: gutter,
        paddingBottom: space[24],
        gap: space[10],
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}
