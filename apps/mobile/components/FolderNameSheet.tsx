import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Folder } from "@deckodecko/core";
import { useCreateFolder, useFolders, useRenameFolder } from "@deckodecko/core/react";
import { folderColor, space, useTheme } from "@deckodecko/ui";
import { BottomSheet, Button, Input, Text } from "@deckodecko/ui/native";

import { FolderIcon, folderIconColor } from "@/components/FolderIcon";
import { FOLDER_NAME_MAX_LENGTH, useFolderNameCheck } from "@/hooks/useFolderNameCheck";

/** 이름 칸 왼쪽 폴더 아이콘 */
const FOLDER_ICON_SIZE = 20;

type Props = {
  open: boolean;
  /** 취소 · 닫기 · 뒤 배경 · 아래로 끌기, 그리고 저장이 끝난 뒤. 여기서 open 을 false 로 바꾼다 */
  onClose: () => void;
  /** 이름을 바꿀 폴더. 생략하면 새 폴더를 만든다 */
  folder?: Folder;
};

/** 폴더 관리의 이름 변경 시트 (시안 B_FolderRename). 머리글의 새 폴더 버튼도 같은 시트를 빈 이름으로 연다. */
export function FolderNameSheet({ open, onClose, folder }: Props) {
  const { t } = useTranslation();
  const { folders: folderColors } = useTheme();
  const folders = useFolders();
  const create = useCreateFolder();
  const rename = useRenameFolder();
  const mutation = folder ? rename : create;

  const [name, setName] = useState("");
  // 열 때마다 이름 칸을 그 폴더의 이름(새 폴더면 빈 칸)으로 채운다
  const target = open ? (folder?.id ?? "") : null;
  const [filledFor, setFilledFor] = useState<string | null>(null);
  if (target !== filledFor) {
    setFilledFor(target);
    if (target !== null) {
      setName(folder?.name ?? "");
      create.reset();
      rename.reset();
    }
  }

  const { taken, checked } = useFolderNameCheck(name, folder?.id);
  const filled = name.trim().length > 0;
  // 저장소처럼 앞뒤 공백만 빼고 비교한다 (cleanName 은 빈 이름에 던지므로 입력 중에는 쓰지 않는다)
  const unchanged = folder !== undefined && name.trim() === folder.name;
  const canSubmit = filled && checked && !unchanged && !mutation.isPending;

  const submit = async () => {
    if (!canSubmit) return;
    try {
      if (folder) await rename.mutateAsync({ id: folder.id, name });
      else await create.mutateAsync(name);
      onClose();
    } catch {
      // 안내는 mutation.error 로 이름 칸 아래에 보인다
    }
  };

  const message =
    filled && taken && !unchanged
      ? { text: t("folder.nameTaken"), color: "accent" as const }
      : mutation.isError
        ? {
            text: folder ? t("folder.renameFailed") : t("folder.createFailed"),
            color: "accent" as const,
          }
        : { text: t("folder.nameHint"), color: "textMuted" as const };
  // 새 폴더는 만들면 목록 맨 뒤에 붙으므로 그 자리의 색으로 미리 보여 준다
  const color = folder
    ? folderIconColor(folderColors, folders.data ?? [], folder)
    : folderColor(
        folderColors,
        { isDefault: false },
        (folders.data ?? []).filter((f) => !f.isDefault).length
      );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={folder ? t("folder.renameTitle") : t("folder.newFolder")}
      closeLabel={t("common.close")}
    >
      <View style={{ gap: space[6] }}>
        <Input
          label={t("folder.nameLabel")}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (mutation.isError) mutation.reset();
          }}
          placeholder={t("folder.namePlaceholder")}
          maxLength={FOLDER_NAME_MAX_LENGTH}
          leading={<FolderIcon size={FOLDER_ICON_SIZE} color={color} />}
          clearLabel={t("common.clear")}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: space[8],
            paddingHorizontal: space[4],
          }}
        >
          <Text
            variant="captionSm"
            color={message.color}
            accessibilityLiveRegion="polite"
            style={{ flex: 1 }}
          >
            {message.text}
          </Text>
          <Text variant="captionSm" color="textMuted">
            {t("folder.nameLength", { length: name.length, max: FOLDER_NAME_MAX_LENGTH })}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: space[10] }}>
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onPress={onClose}
          style={{ flex: 1 }}
        >
          {t("common.cancel")}
        </Button>
        <Button disabled={!canSubmit} onPress={submit} style={{ flex: 1 }}>
          {folder ? t("folder.rename") : t("folder.create")}
        </Button>
      </View>
    </BottomSheet>
  );
}
