import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View, type AccessibilityActionEvent } from "react-native";
import ReorderableList, {
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from "react-native-reorderable-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Folder } from "@deckodecko/core";
import { useFolders, useItemCountsByFolder, useReorderFolders } from "@deckodecko/core/react";
import { border, gutter, radius, space, useTheme, type FolderColor } from "@deckodecko/ui";
import { Card, PRESSED_OPACITY, Text, useToast } from "@deckodecko/ui/native";

import { FolderDeleteSheet } from "@/components/FolderDeleteSheet";
import { FolderIcon, folderIconColor } from "@/components/FolderIcon";
import { FolderNameSheet } from "@/components/FolderNameSheet";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { StateMessage } from "@/components/StateMessage";
import { folderName } from "@/lib/displayName";
import { formatFolderItemCount } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/routes";

/** 폴더 행 높이 */
const ROW_HEIGHT = 64;
/** 폴더 행 왼쪽 아이콘 */
const FOLDER_ICON_SIZE = 22;
/** 행 오른쪽 버튼 (이름 변경 · 삭제 · 순서 손잡이) */
const ACTION_SIZE = 40;
/** 행 오른쪽 버튼 안 아이콘 · 기본 폴더 자물쇠 */
const ACTION_ICON_SIZE = 18;

/**
 * 폴더 관리 (시안 B_FolderManage). 내 굿즈 머리글의 폴더 버튼으로 들어온다.
 * 기본 폴더는 맨 위에 고정이고, 나머지는 손잡이를 길게 눌러 끌어서 순서를 바꾼다.
 */
export default function FolderManageScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { folders: folderColors } = useTheme();
  const toast = useToast();
  const folders = useFolders();
  const counts = useItemCountsByFolder();
  const reorder = useReorderFolders();
  // 시트마다 open 을 따로 둔다. 하나를 닫는 애니메이션 중에 다른 시트를 열어도 닫히던 시트가 끝까지 그려지게
  const [nameSheet, setNameSheet] = useState<{ open: boolean; folder?: Folder }>({ open: false });
  // 지울 폴더는 닫힌 뒤에도 남겨 둔다 (닫히는 동안 그릴 내용)
  const [deleteSheet, setDeleteSheet] = useState<{ open: boolean; folder?: Folder }>({
    open: false,
  });

  const list = folders.data ?? [];
  const defaultFolder = list.find((f) => f.isDefault);
  const normal = list.filter((f) => !f.isDefault);
  const countOf = (folder: Folder) => counts.data?.[folder.id] ?? 0;
  const totalItems = Object.values(counts.data ?? {}).reduce((sum, n) => sum + n, 0);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= normal.length) return;
    // 캐시는 훅이 바로 바꾸고, 실패하면 훅이 되돌린다. mutate 의 onError 는 연달아 부르면 마지막 것만 불려서 쓰지 않는다
    reorder
      .mutateAsync(reorderItems(normal, from, to).map((f) => f.id))
      .catch(() => toast.show({ title: t("folder.reorderFailed") }));
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: insets.top + space[16],
          paddingHorizontal: gutter,
          paddingBottom: space[8],
        }}
      >
        <HeaderIconButton
          icon="chevron-back"
          variant="outline"
          label={t("common.back")}
          onPress={goBackOrHome}
        />
        <Text variant="titleLg" accessibilityRole="header">
          {t("folder.manageTitle")}
        </Text>
        <HeaderIconButton
          icon="add"
          variant="primary"
          label={t("folder.newFolder")}
          onPress={() => setNameSheet({ open: true })}
        />
      </View>

      {folders.isError ? (
        <StateMessage fill message={t("common.loadFailed")} onRetry={() => folders.refetch()} />
      ) : (
        <ReorderableList
          data={normal}
          keyExtractor={(folder) => folder.id}
          onReorder={({ from, to }: ReorderableListReorderEvent) => move(from, to)}
          renderItem={({ item, index }) => (
            <NormalFolderRow
              folder={item}
              name={folderName(item, t)}
              color={folderIconColor(folderColors, list, item)}
              count={countOf(item)}
              first={index === 0}
              last={index === normal.length - 1}
              onRename={() => setNameSheet({ open: true, folder: item })}
              onDelete={() => setDeleteSheet({ open: true, folder: item })}
              onMove={(offset) => move(index, index + offset)}
            />
          )}
          ListHeaderComponent={
            <View style={{ gap: space[16], paddingBottom: space[10] }}>
              <Text variant="caption" color="textMuted">
                {folders.data
                  ? `${t("folder.folderCount", { count: list.length })} · ${formatFolderItemCount(totalItems)}. ${t("folder.dragHint")}`
                  : ""}
              </Text>
              {defaultFolder ? (
                <DefaultFolderRow folder={defaultFolder} count={countOf(defaultFolder)} />
              ) : null}
            </View>
          }
          ListFooterComponent={<DeleteInfo />}
          ItemSeparatorComponent={RowGap}
          contentContainerStyle={{
            paddingTop: space[10],
            paddingHorizontal: space[24],
            paddingBottom: insets.bottom + space[24],
          }}
        />
      )}

      <FolderNameSheet
        open={nameSheet.open}
        onClose={() => setNameSheet((s) => ({ ...s, open: false }))}
        folder={nameSheet.folder}
      />
      {deleteSheet.folder ? (
        <FolderDeleteSheet
          key={deleteSheet.folder.id}
          open={deleteSheet.open}
          onClose={() => setDeleteSheet((s) => ({ ...s, open: false }))}
          folder={deleteSheet.folder}
          name={folderName(deleteSheet.folder, t)}
        />
      ) : null}
    </View>
  );
}

function RowGap() {
  return <View style={{ height: space[10] }} />;
}

/** 행 바탕: 흰 카드 + 테두리 */
function RowFrame({ children, trailingInset }: { children: ReactNode; trailingInset: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[12],
        height: ROW_HEIGHT,
        paddingLeft: space[14],
        paddingRight: trailingInset,
        borderRadius: radius.row,
        borderWidth: border.default,
        borderColor: colors.line,
        backgroundColor: colors.surface,
      }}
    >
      {children}
    </View>
  );
}

/** 기본 폴더: 이름 변경 · 삭제 · 순서 바꾸기 없이 자물쇠만 */
function DefaultFolderRow({ folder, count }: { folder: Folder; count: number }) {
  const { t } = useTranslation();
  const { colors, folders: folderColors } = useTheme();
  return (
    <RowFrame trailingInset={space[14]}>
      <FolderIcon size={FOLDER_ICON_SIZE} color={folderColors.default} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {folderName(folder, t)}
        </Text>
        <Text variant="captionSm" color="textMuted" numberOfLines={1}>
          {`${formatFolderItemCount(count)} · ${t("folder.defaultLocked")}`}
        </Text>
      </View>
      <Ionicons name="lock-closed-outline" size={ACTION_ICON_SIZE} color={colors.textFaint} />
    </RowFrame>
  );
}

function NormalFolderRow({
  name,
  color,
  count,
  first,
  last,
  onRename,
  onDelete,
  onMove,
}: {
  folder: Folder;
  name: string;
  color: FolderColor;
  count: number;
  first: boolean;
  last: boolean;
  onRename: () => void;
  onDelete: () => void;
  /** 화면 읽기 프로그램의 위로 · 아래로 옮기기 (-1 · +1) */
  onMove: (offset: number) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const drag = useReorderableDrag();

  const actions = [
    ...(first ? [] : [{ name: "moveUp", label: t("folder.moveUp") }]),
    ...(last ? [] : [{ name: "moveDown", label: t("folder.moveDown") }]),
  ];
  const onAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === "moveUp") onMove(-1);
    if (event.nativeEvent.actionName === "moveDown") onMove(1);
  };

  return (
    <RowFrame trailingInset={space[10]}>
      <FolderIcon size={FOLDER_ICON_SIZE} color={color} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="captionSm" color="textMuted">
          {formatFolderItemCount(count)}
        </Text>
      </View>
      <RowAction label={t("folder.renameLabel", { name })} onPress={onRename} filled>
        <Ionicons name="pencil-outline" size={ACTION_ICON_SIZE} color={colors.textMuted} />
      </RowAction>
      <RowAction label={t("folder.deleteLabel", { name })} onPress={onDelete} filled>
        <Ionicons name="trash-outline" size={ACTION_ICON_SIZE} color={colors.accent} />
      </RowAction>
      <RowAction
        label={t("folder.dragLabel", { name })}
        onLongPress={drag}
        accessibilityActions={actions}
        onAccessibilityAction={onAction}
      >
        <Ionicons name="reorder-three" size={ACTION_ICON_SIZE} color={colors.textFaint} />
      </RowAction>
    </RowFrame>
  );
}

function RowAction({
  label,
  onPress,
  onLongPress,
  filled = false,
  accessibilityActions,
  onAccessibilityAction,
  children,
}: {
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  /** 바탕색 칸 (이름 변경 · 삭제). 순서 손잡이는 바탕 없이 */
  filled?: boolean;
  accessibilityActions?: { name: string; label: string }[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={({ pressed }) => ({
        width: ACTION_SIZE,
        height: ACTION_SIZE,
        borderRadius: radius.thumb,
        backgroundColor: filled ? colors.bg : undefined,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/** 목록 아래 안내: 폴더를 지우면 아이템이 어떻게 되는지 */
function DeleteInfo() {
  const { t } = useTranslation();
  return (
    <Card
      style={{
        marginTop: space[16],
        paddingVertical: space[14],
        paddingHorizontal: space[16],
        gap: space[10],
      }}
    >
      <Text variant="bodyStrong">{t("folder.deleteInfoTitle")}</Text>
      <Text variant="caption" color="textMuted">
        {t("folder.deleteInfo")}
      </Text>
    </Card>
  );
}
