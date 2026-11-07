import { Ionicons } from "@expo/vector-icons";
import type { TFunction } from "i18next";
import { useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import type { Folder, Item } from "@deckodecko/core";
import { useDeleteFolder, useItems } from "@deckodecko/core/react";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { BottomSheet, Button, Text } from "@deckodecko/ui/native";

import { photoUri } from "@/lib/photos";

/** 위쪽 휴지통 원 지름 */
const ICON_CIRCLE_SIZE = 56;
/** 휴지통 아이콘 */
const ICON_SIZE = 26;
/** 옮겨질 아이템 사진 */
const THUMB_SIZE = 36;
/** 사진이 겹치는 폭 */
const THUMB_OVERLAP = 8;
/** 사진이 없을 때 사진 칸 안 아이콘 */
const THUMB_ICON_SIZE = 16;
/** 미리보기에 사진 · 이름을 보여 줄 아이템 수 */
const PREVIEW_COUNT = 3;

type Props = {
  open: boolean;
  /** 취소 · 뒤 배경 · 아래로 끌기 · Android 뒤로가기, 그리고 지운 뒤. 여기서 open 을 false 로 바꾼다 */
  onClose: () => void;
  /** 지울 폴더 (기본 폴더가 아닌 것). 닫히는 동안에도 같은 값을 넘기고, 폴더가 바뀌면 key 로 새로 그린다 */
  folder: Folder;
  /** 표시 이름 */
  name: string;
  /** 폴더 안 아이템 수 (화면이 이미 읽은 폴더별 개수). 못 읽었으면 undefined */
  count: number | undefined;
};

/**
 * 폴더 관리의 삭제 확인 시트 (시안 B_FolderDelete).
 * 시안은 안의 아이템도 지운다고 하지만, 저장소 규칙대로 아이템은 기본 폴더로 옮겨지고 그렇게 안내한다.
 */
export function FolderDeleteSheet({ open, onClose, folder, name, count: liveCount }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const remove = useDeleteFolder();
  const hold = remove.isPending || remove.isSuccess;
  // 지우는 중 · 지운 뒤에는 읽지 않는다. 없어진 폴더를 invalidate 때마다 다시 읽지 않게
  const items = useItems({ folderId: folder.id, limit: PREVIEW_COUNT }, { enabled: !hold });
  // 지우는 중 · 지운 뒤에는 옮겨진 뒤의 빈 목록 · 0개로 문구가 바뀌지 않게 마지막 값을 그대로 둔다
  const [shown, setShown] = useState({ items: items.data, count: liveCount });
  if (!hold && (items.data !== shown.items || liveCount !== shown.count)) {
    setShown({ items: items.data, count: liveCount });
  }
  const count = shown.count;

  const close = () => {
    // 지우는 중에는 reset 하지 않는다. hold 가 풀리면 지우고 있는 폴더를 다시 읽는다
    if (!remove.isPending) remove.reset();
    onClose();
  };

  const confirm = async () => {
    if (remove.isPending) return;
    try {
      await remove.mutateAsync(folder.id);
      // reset 하지 않는다. 닫히는 동안 옮겨지기 전 개수가 그대로 보이게 (다른 폴더는 key 로 새로 그린다)
      onClose();
    } catch {
      // 안내는 remove.error 로 버튼 위에 보인다
    }
  };

  return (
    <BottomSheet open={open} onClose={close}>
      <View style={{ alignItems: "center", gap: space[10], paddingTop: space[6] }}>
        <View
          style={{
            width: ICON_CIRCLE_SIZE,
            height: ICON_CIRCLE_SIZE,
            borderRadius: radius.full,
            backgroundColor: colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="trash-outline" size={ICON_SIZE} color={colors.accent} />
        </View>
        <Text variant="headingSm" accessibilityRole="header" style={{ textAlign: "center" }}>
          {t("folder.deleteTitle", { name })}
        </Text>
        {count === undefined ? null : count === 0 ? (
          <MessageText>{t("folder.deleteEmptyMessage")}</MessageText>
        ) : (
          // parent 로 넘기면 Trans 가 번역 조각을 MessageText 의 직접 자식으로 주므로 Text 가 글자별 글꼴을 나눌 수 있다
          <Trans
            parent={MessageText}
            i18nKey="folder.deleteMoveMessage"
            count={count}
            components={{ bold: <Text variant="caption" weight="bold" color="accent" /> }}
          />
        )}
      </View>

      {shown.items && shown.items.length > 0 ? (
        <MovedItemsPreview items={shown.items} total={count} />
      ) : null}

      {remove.isError ? (
        <Text variant="captionSm" color="accent" accessibilityLiveRegion="polite">
          {t("folder.deleteFailed")}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: space[10] }}>
        <Button variant="secondary" disabled={remove.isPending} onPress={close} style={{ flex: 1 }}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" disabled={remove.isPending} onPress={confirm} style={{ flex: 1 }}>
          {t("folder.delete")}
        </Button>
      </View>
    </BottomSheet>
  );
}

function MessageText({ children }: { children?: ReactNode }) {
  return (
    <Text variant="caption" color="textMuted" style={{ textAlign: "center" }}>
      {children}
    </Text>
  );
}

/** 이름을 이어 붙이는 문장 부호는 언어마다 달라서 개수별 번역 키로 둔다 (PREVIEW_COUNT 와 맞춘다) */
function previewText(t: TFunction, head: readonly Item[], rest: number): string {
  const [a = "", b = "", c = ""] = head.map((item) => item.name);
  if (rest > 0) return t("folder.deletePreviewMore", { a, b, c, count: rest });
  if (head.length >= 3) return t("folder.deletePreview3", { a, b, c });
  if (head.length === 2) return t("folder.deletePreview2", { a, b });
  return t("folder.deletePreview1", { a });
}

/** 옮겨질 아이템: 앞의 몇 개 사진을 겹쳐 놓고 "이름, 이름, 이름 외 N개". total 을 모르면 남은 개수 없이 */
function MovedItemsPreview({
  items,
  total,
}: {
  items: readonly Item[];
  total: number | undefined;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const head = items.slice(0, PREVIEW_COUNT);
  const rest = total === undefined ? 0 : Math.max(total - head.length, 0);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[10],
        paddingVertical: space[12],
        paddingHorizontal: space[14],
        borderRadius: radius.field,
        backgroundColor: colors.bg,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {head.map((item, i) => (
          <View
            key={item.id}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              marginLeft: i === 0 ? 0 : -THUMB_OVERLAP,
              borderRadius: radius.thumb,
              borderWidth: border.default,
              borderColor: colors.surface,
              backgroundColor: colors.lineSoft,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.thumbnail ? (
              <Image
                source={{ uri: photoUri(item.thumbnail) }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="image-outline" size={THUMB_ICON_SIZE} color={colors.textMuted} />
            )}
          </View>
        ))}
      </View>
      <Text variant="captionSm" color="textMuted" numberOfLines={2} style={{ flex: 1 }}>
        {previewText(t, head, rest)}
      </Text>
    </View>
  );
}
