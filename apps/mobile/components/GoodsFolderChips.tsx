import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import type { Folder } from "@deckodecko/core";
import { gutter, space } from "@deckodecko/ui";
import { Chip } from "@deckodecko/ui/native";

import { folderName } from "@/lib/displayName";

type Props = {
  folders: Folder[];
  /** 고른 폴더 id. null 이면 "전체" */
  selected: string | null;
  onSelect: (folderId: string | null) => void;
};

/** 내 굿즈의 "전체" + 폴더 칩 (폴더 목록 순서, 기본 폴더가 앞). 가로로 넘긴다. */
export function GoodsFolderChips({ folders, selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={t("goods.folderLabel")}
      contentContainerStyle={{ paddingHorizontal: gutter, gap: space[8] }}
      style={{ flexGrow: 0 }}
    >
      <Chip selectedTone="inverse" selected={selected == null} onPress={() => onSelect(null)}>
        {t("goods.allFolders")}
      </Chip>
      {folders.map((folder) => (
        <Chip
          key={folder.id}
          selectedTone="inverse"
          selected={selected === folder.id}
          onPress={() => onSelect(folder.id)}
        >
          {folderName(folder, t)}
        </Chip>
      ))}
    </ScrollView>
  );
}
