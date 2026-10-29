import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import type { Item } from "@deckodecko/core";
import { useDeleteItem, useFolders, useGacha, useItemCounts } from "@deckodecko/core/react";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { Button, BottomSheet, Text } from "@deckodecko/ui/native";

import { folderName, gachaName } from "@/lib/displayName";
import { photoUri } from "@/lib/photos";

/** 위쪽 휴지통 원 지름 */
const ICON_CIRCLE_SIZE = 56;
/** 휴지통 아이콘 */
const ICON_SIZE = 26;
/** 지울 기록 카드의 사진 */
const THUMB_SIZE = 52;
/** 사진이 없을 때 사진 칸 안 아이콘 */
const THUMB_ICON_SIZE = 20;
/** 소장 수 안내 앞 아이콘 */
const INFO_ICON_SIZE = 16;

type Props = {
  open: boolean;
  /** 취소 · 뒤 배경 · 아래로 끌기 · Android 뒤로가기. 여기서 open 을 false 로 바꿔 수정 시트로 돌아간다 */
  onClose: () => void;
  /** 지운 뒤. 이 시트와 수정 시트의 open 을 모두 false 로 바꿔 상세로 돌아간다 */
  onDeleted: () => void;
  /** 지울 기록 (수정 시트를 열 때 불러온 값) */
  item: Item;
};

/** 수정 시트의 삭제를 누르면 위에 여는 확인 시트 (시안 B_ItemDelete). */
export function ItemDeleteSheet({ open, onClose, onDeleted, item }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const remove = useDeleteItem();

  const close = () => {
    // 다음에 열 때 지난번 실패 안내가 남지 않게
    remove.reset();
    onClose();
  };

  const confirm = async () => {
    if (remove.isPending) return;
    try {
      await remove.mutateAsync(item.id);
      onDeleted();
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
          {t("item.deleteTitle")}
        </Text>
        <Text variant="caption" color="textMuted" style={{ textAlign: "center" }}>
          {t("item.deleteMessage")}
        </Text>
      </View>

      <ItemSummary item={item} />

      {item.type === "GET" ? (
        <OwnedCountChange gachaId={item.gachaId} hold={remove.isPending || remove.isSuccess} />
      ) : null}

      {remove.isError ? (
        <Text variant="captionSm" color="accent" accessibilityLiveRegion="polite">
          {t("item.deleteFailed")}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: space[10] }}>
        <Button variant="secondary" disabled={remove.isPending} onPress={close} style={{ flex: 1 }}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" disabled={remove.isPending} onPress={confirm} style={{ flex: 1 }}>
          {t("item.delete")}
        </Button>
      </View>
    </BottomSheet>
  );
}

/** 지울 기록: 사진 · WISH/GET · 이름 · "가챠 이름 · 폴더 이름" */
function ItemSummary({ item }: { item: Item }) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const gacha = useGacha(item.gachaId);
  const folders = useFolders();
  const folder = folders.data?.find((f) => f.id === item.folderId);
  // 불러오기 전이거나 카탈로그에 없는 가챠면 그 조각만 뺀다
  const subtitle = [
    gacha.data ? gachaName(gacha.data, i18n.language) : null,
    folder ? folderName(folder, t) : null,
  ]
    .filter((part): part is string => !!part)
    .join(" · ");
  const get = item.type === "GET";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[12],
        paddingVertical: space[12],
        paddingHorizontal: space[14],
        borderRadius: radius.field,
        backgroundColor: colors.bg,
      }}
    >
      <View
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: radius.thumb,
          borderWidth: border.default,
          borderColor: colors.line,
          backgroundColor: colors.surface,
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
      <View style={{ flex: 1, minWidth: 0, gap: space[2] }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space[6] }}>
          <Text
            variant="captionSm"
            weight="bold"
            color={get ? "onGet" : "onWish"}
            style={{
              backgroundColor: get ? colors.getSurface : colors.wishSurface,
              borderRadius: radius.full,
              overflow: "hidden",
              paddingHorizontal: space[8],
              paddingVertical: space[2],
            }}
          >
            {get ? t("item.getBadge") : t("item.wishBadge")}
          </Text>
          <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
            {item.name}
          </Text>
        </View>
        <Text variant="captionSm" color="textMuted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/** GET 기록을 지울 때만: "이 가챠의 소장 수가 2 → 1로 바뀌어요." */
function OwnedCountChange({
  gachaId,
  hold,
}: {
  gachaId: string;
  /** 지우는 중 · 지운 뒤. 삭제가 반영된 소장 수로 바뀌지 않게 보이던 숫자를 그대로 둔다 */
  hold: boolean;
}) {
  const { colors } = useTheme();
  const counts = useItemCounts(gachaId);
  const [from, setFrom] = useState<number>();
  const latest = counts.data?.get;
  if (!hold && latest !== undefined && latest !== from) setFrom(latest);
  if (from === undefined) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[8],
        paddingHorizontal: space[2],
      }}
    >
      <Ionicons name="information-circle-outline" size={INFO_ICON_SIZE} color={colors.textMuted} />
      {/* parent 로 넘기면 Trans 가 번역 조각을 CountText 의 직접 자식으로 주므로 Text 가 글자별 글꼴을 나눌 수 있다 */}
      <Trans
        parent={CountText}
        i18nKey="item.deleteCountChange"
        values={{ from, to: Math.max(from - 1, 0) }}
        components={{ bold: <Text variant="captionSm" weight="bold" /> }}
      />
    </View>
  );
}

function CountText({ children }: { children?: ReactNode }) {
  return (
    <Text variant="captionSm" color="textMuted" style={{ flex: 1 }}>
      {children}
    </Text>
  );
}
