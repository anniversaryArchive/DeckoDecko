import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Item } from "@deckodecko/core";
import { useToast } from "@deckodecko/ui/native";

import { ItemSheet } from "@/components/ItemSheet";

/**
 * 기록 수정 시트를 여는 함수와 그릴 시트. 저장에 실패하면 "다시 열기" 토스트를 띄운다.
 * sheet 는 목록이 비거나 바뀌어도 언마운트되지 않는 자리에 둔다 (닫힘 애니메이션이 끊기지 않게).
 */
export function useItemEditSheet() {
  const { t } = useTranslation();
  const toast = useToast();
  const [editing, setEditing] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);
  function openSheet(item: Item) {
    setEditing(item);
    setOpen(true);
  }
  const sheet = editing ? (
    <ItemSheet
      open={open}
      onClose={() => setOpen(false)}
      gachaId={editing.gachaId}
      itemId={editing.id}
      onSaveFailed={(reason) => {
        const reopen = editing;
        toast.show({
          title: t("detail.saveFailed"),
          message: reason,
          actionLabel: t("detail.reopenSheet"),
          onAction: () => openSheet(reopen),
        });
      }}
    />
  ) : null;
  return { openSheet, sheet };
}
