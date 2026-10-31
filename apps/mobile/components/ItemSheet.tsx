import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionSheetIOS, Alert, Image, Platform, Pressable, View } from "react-native";

import type { Folder, Item, ItemType } from "@deckodecko/core";
import {
  useCreateItem,
  useFolders,
  useIsItemNameTaken,
  useItem,
  useReadDisplayedItemType,
  useUpdateItem,
} from "@deckodecko/core/react";
import { border, radius, space, useTheme } from "@deckodecko/ui";
import { BottomSheet, Button, Input, PRESSED_OPACITY, Segment, Text } from "@deckodecko/ui/native";

import { FolderIcon, folderIconColor } from "@/components/FolderIcon";
import { FolderSelectSheet } from "@/components/FolderSelectSheet";
import { ItemDeleteSheet } from "@/components/ItemDeleteSheet";
import { folderName } from "@/lib/displayName";
import { formatDate } from "@/lib/i18n";
import { NAME_CHECK_DELAY, useDebouncedValue } from "@/lib/useDebouncedValue";

/** 사진 칸 (정사각형) */
const PHOTO_SIZE = 88;
/** 빈 사진 칸의 카메라 아이콘 */
const PHOTO_ICON_SIZE = 22;
/** 사진 위 "사진 바꾸기" 원형 표시 지름 */
const CHANGE_BADGE_SIZE = 28;
/** "사진 바꾸기" 표시 안 카메라 아이콘 */
const CHANGE_ICON_SIZE = 14;
/** 폴더 행 높이 */
const FOLDER_ROW_HEIGHT = 52;
/** 폴더 행 왼쪽 폴더 아이콘 */
const FOLDER_ICON_SIZE = 20;
/** 폴더 행 오른쪽 화살표 */
const CHEVRON_SIZE = 18;
/** 수정 시트의 삭제 버튼 폭 */
const DELETE_WIDTH = 110;

type Form = {
  type: ItemType;
  name: string;
  /** 비어 있으면 기본 폴더 */
  folderId: string | undefined;
  /** 고른 사진의 파일 주소 */
  thumbnail: string | null;
  memo: string;
};

const EMPTY_FORM: Form = { type: "WISH", name: "", folderId: undefined, thumbnail: null, memo: "" };

/** 고른 폴더. 고르지 않았거나 그새 지워졌으면 기본 폴더 */
function pickedFolder(folders: readonly Folder[] | undefined, folderId: string | undefined) {
  return folders?.find((f) => f.id === folderId) ?? folders?.find((f) => f.isDefault);
}

/** 저장에 실패해 닫은 입력. for 는 기록 id (추가 시트면 `add:${gachaId}`), baseType 은 그 입력을 채울 때 보이던 WISH · GET */
type Draft = { for: string; form: Form; baseType: ItemType | undefined };

/**
 * 시트를 열 때 채울 입력. shownType 은 지금 보일 WISH · GET (태그 전환이 저장 중이면 마지막으로 누른 값).
 * 남은 입력이 있으면 이어서 쓰되, 시트에서 type 을 고르지 않았으면 그 사이 태그로 바꾼 값을 따른다.
 */
function initialForm(
  item: Item | undefined,
  shownType: ItemType | undefined,
  kept: Draft | undefined
): Form {
  if (kept) {
    const typeKept = !shownType || kept.form.type !== kept.baseType;
    return typeKept ? kept.form : { ...kept.form, type: shownType };
  }
  if (!item || !shownType) return EMPTY_FORM;
  return {
    type: shownType,
    name: item.name,
    folderId: item.folderId,
    thumbnail: item.thumbnail,
    memo: item.memo ?? "",
  };
}

type Props = {
  open: boolean;
  /** 닫기 버튼 · 뒤 배경 · 아래로 끌기 · Android 뒤로가기, 그리고 저장 · 삭제가 끝났을 때. 여기서 open 을 false 로 바꾼다 */
  onClose: () => void;
  /** 기록을 남길 가챠. 이름 중복은 이 가챠 안에서만 본다 */
  gachaId: string;
  /** 넘기면 그 기록을 고치는 수정 시트, 생략하면 추가 시트. 열 때의 값을 쓴다 */
  itemId?: string;
  /** 저장에 실패하면 시트를 닫은 뒤 부른다. reason 은 토스트 둘째 줄에 쓸 문구 (시안 B_DetailToast) */
  onSaveFailed: (reason: string) => void;
};

/**
 * 상세에서 여는 아이템 추가 · 수정 시트 (시안 B_ItemSheet · B_ItemSheetEdit).
 * 열 때마다 입력을 새로 채운다: 추가는 빈 값, 수정은 저장된 기록 (WISH · GET 은 태그 전환이 저장 중이면 마지막으로 누른 값).
 * 저장에 실패해 닫혔으면 같은 시트(같은 기록 · 추가)를 다시 열 때 그 입력을 이어서 보여 준다.
 * 폴더 선택 · 삭제 확인은 이 시트 위에 여는 시트다 (시안 B_FolderSheet · B_ItemDelete).
 */
export function ItemSheet({ open, onClose, gachaId, itemId, onSaveFailed }: Props) {
  const { t } = useTranslation();
  const item = useItem(itemId);
  const folders = useFolders();
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const readDisplayedType = useReadDisplayedItemType();

  // 열릴 때마다 한 번 입력을 채운다. 수정은 기록을 다시 불러오는 중이면 끝난 뒤에 채운다
  const [wasOpen, setWasOpen] = useState(open);
  const [filled, setFilled] = useState(false);
  // 저장 · 삭제 뒤 기록이 다시 불려도 닫히는 동안 내용이 바뀌지 않게 채울 때의 기록을 들고 있다
  const [editingItem, setEditingItem] = useState<Item>();
  const [draft, setDraft] = useState<Draft>();
  const [baseType, setBaseType] = useState<ItemType>();
  // 열 때마다 입력 영역을 새로 그린다. 지난번 저장 요청 상태가 남지 않게
  const [session, setSession] = useState(0);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFilled(false);
      setSession((n) => n + 1);
    }
  }
  if (open && !filled && (!itemId || (item.data && !item.isFetching))) {
    setFilled(true);
    setEditingItem(item.data ?? undefined);
    // 태그 전환이 저장 중이면 기록에는 아직 옛 type 이 있다
    const shownType = item.data ? readDisplayedType(item.data) : undefined;
    setBaseType(shownType);
    const kept = draft?.for === (itemId ?? `add:${gachaId}`) ? draft : undefined;
    setDraft(undefined);
    setForm(initialForm(item.data ?? undefined, shownType, kept));
  }

  // 열 때 정한 모드를 닫힐 때까지 유지한다. 닫는 동안 화면이 itemId 를 지워도 제목 · 버튼이 바뀌지 않는다
  const editing = filled ? editingItem !== undefined : itemId !== undefined;

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title={editing ? t("item.editTitle") : t("item.addTitle")}
        closeLabel={t("common.close")}
      >
        {filled ? (
          <ItemForm
            key={session}
            gachaId={gachaId}
            item={editingItem}
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onOpenFolders={() => setFolderSheetOpen(true)}
            onDelete={() => setDeleteSheetOpen(true)}
            onDone={onClose}
            onSaveFailed={(reason) => {
              setDraft({ for: editingItem?.id ?? `add:${gachaId}`, form, baseType });
              onClose();
              onSaveFailed(reason);
            }}
          />
        ) : (
          <Text color="textMuted">
            {/* 없는 기록(다른 곳에서 지움)이면 null 이 온다 */}
            {item.isError || item.data === null ? t("common.loadFailed") : t("common.loading")}
          </Text>
        )}
      </BottomSheet>

      <FolderSelectSheet
        open={folderSheetOpen}
        onClose={() => setFolderSheetOpen(false)}
        onCloseAll={() => {
          setFolderSheetOpen(false);
          onClose();
        }}
        selectedFolderId={pickedFolder(folders.data, form.folderId)?.id}
        onSelect={(folderId) => {
          setForm((prev) => ({ ...prev, folderId }));
          setFolderSheetOpen(false);
        }}
      />

      {editingItem ? (
        <ItemDeleteSheet
          // 열 때마다 지난번 삭제 요청 상태를 비운다
          key={session}
          open={deleteSheetOpen}
          onClose={() => setDeleteSheetOpen(false)}
          onDeleted={() => {
            setDeleteSheetOpen(false);
            onClose();
          }}
          item={editingItem}
        />
      ) : null}
    </>
  );
}

function ItemForm({
  gachaId,
  item,
  form,
  onChange,
  onOpenFolders,
  onDelete,
  onDone,
  onSaveFailed,
}: {
  gachaId: string;
  /** 수정 중인 기록. 추가 시트면 없다 */
  item: Item | undefined;
  form: Form;
  onChange: (patch: Partial<Form>) => void;
  onOpenFolders: () => void;
  /** 삭제를 눌렀을 때. 삭제 확인 시트를 연다 */
  onDelete: () => void;
  onDone: () => void;
  onSaveFailed: (reason: string) => void;
}) {
  const { t } = useTranslation();
  const checkedName = useDebouncedValue(form.name, NAME_CHECK_DELAY);
  const taken = useIsItemNameTaken(gachaId, checkedName, item?.id);
  const folders = useFolders();
  const create = useCreateItem();
  const update = useUpdateItem();

  const filled = form.name.trim().length > 0;
  const busy = create.isPending || update.isPending;
  // 지금 이름의 중복 검사 결과가 오기 전에는 저장하지 않는다 (저장소는 중복을 막지 않는다)
  const canSave = filled && checkedName === form.name && taken.data === false && !busy;

  const save = async () => {
    if (!canSave) return;
    const memo = form.memo.trim() || null;
    // 폴더 행에 보이는 폴더로 저장한다
    const folderId = pickedFolder(folders.data, form.folderId)?.id ?? form.folderId;
    try {
      if (item) {
        await update.mutateAsync({
          id: item.id,
          input: {
            type: form.type,
            name: form.name,
            folderId,
            thumbnail: form.thumbnail,
            memo,
          },
        });
      } else {
        await create.mutateAsync({
          gachaId,
          type: form.type,
          name: form.name,
          folderId,
          thumbnail: form.thumbnail,
          memo,
        });
      }
      onDone();
    } catch {
      onSaveFailed(t("item.saveFailedReason"));
    }
  };

  const nameMessage =
    filled && taken.data
      ? { text: t("item.nameTaken"), color: "accent" as const }
      : filled && taken.isError
        ? // 검사가 실패하면 저장 버튼이 꺼진 채라 이유를 알린다. 이름을 바꾸면 다시 검사한다
          { text: t("item.nameCheckFailed"), color: "accent" as const }
        : item
          ? {
              // 사진 수는 지금 입력 기준 (사진을 지우면 바로 빠진다)
              text: t(form.thumbnail ? "item.registeredWithPhoto" : "item.registered", {
                date: formatDate(new Date(item.createdAt)),
              }),
              color: "textMuted" as const,
            }
          : { text: t("item.nameHint"), color: "textMuted" as const };

  return (
    <>
      <Segment
        value={form.type}
        onChange={(type) => onChange({ type })}
        accessibilityLabel={t("item.typeLabel")}
        options={[
          { value: "WISH", label: t("item.wish") },
          { value: "GET", label: t("item.get"), tone: "get" },
        ]}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: space[12] }}>
        <PhotoPicker uri={form.thumbnail} onChange={(thumbnail) => onChange({ thumbnail })} />
        <View style={{ flex: 1, gap: space[6] }}>
          <Input
            label={t("item.nameLabel")}
            value={form.name}
            onChangeText={(name) => onChange({ name })}
            clearLabel={t("common.clear")}
            returnKeyType="done"
          />
          <Text variant="captionSm" color={nameMessage.color} accessibilityLiveRegion="polite">
            {nameMessage.text}
          </Text>
        </View>
      </View>

      <FolderRow folderId={form.folderId} onPress={onOpenFolders} />

      <Input
        label={t("item.memoLabel")}
        value={form.memo}
        onChangeText={(memo) => onChange({ memo })}
        placeholder={t("item.memoPlaceholder")}
        multiline
      />

      {item ? (
        <View style={{ flexDirection: "row", gap: space[10] }}>
          <Button
            variant="secondary"
            disabled={busy}
            onPress={onDelete}
            style={{ width: DELETE_WIDTH }}
          >
            {t("item.delete")}
          </Button>
          <Button disabled={!canSave} onPress={save} style={{ flex: 1 }}>
            {t("item.save")}
          </Button>
        </View>
      ) : (
        <Button fullWidth disabled={!canSave} onPress={save}>
          {t("item.add")}
        </Button>
      )}
    </>
  );
}

/**
 * 사진 칸. 비어 있으면 누를 때 시스템 사진 선택기를 연다.
 * 사진이 있으면 바꾸기 · 지우기를 고르게 한다 (iOS 액션 시트, Android 알림창). 시안에는 바꾸기만 있다.
 * 선택기는 운영체제가 띄우고 고른 사진만 앱에 넘겨서 사진첩 권한을 요청하지 않는다 (iOS PHPicker · Android Photo Picker).
 * 넘겨받은 주소는 선택기가 만든 임시 복사본이라 OS 가 지울 수 있다.
 */
function PhotoPicker({
  uri,
  onChange,
}: {
  uri: string | null;
  onChange: (uri: string | null) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const pick = async () => {
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
    } catch {
      // 선택기를 열지 못하면 사진을 그대로 둔다. 다시 누르면 된다
      return;
    }
    const picked = result.canceled ? undefined : result.assets[0];
    // TODO(혜진): 3주차에 고른 사진을 앱 폴더로 복사하고 그 주소를 저장한다
    if (picked) onChange(picked.uri);
  };

  const showOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("item.changePhoto"), t("item.removePhoto"), t("common.cancel")],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) void pick();
          else if (index === 1) onChange(null);
        }
      );
      return;
    }
    // Android 알림창은 버튼을 오른쪽부터 놓아서, 바꾸기가 가장 오른쪽(주요 동작 자리)에 온다
    Alert.alert(t("item.photoOptions"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("item.removePhoto"), style: "destructive", onPress: () => onChange(null) },
      { text: t("item.changePhoto"), onPress: () => void pick() },
    ]);
  };

  return (
    <Pressable
      onPress={uri ? showOptions : pick}
      accessibilityRole="button"
      accessibilityLabel={uri ? t("item.photoOptions") : t("item.addPhoto")}
      style={({ pressed }) => ({
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
        borderRadius: radius.row,
        borderWidth: border.default,
        borderStyle: uri ? "solid" : "dashed",
        borderColor: uri ? colors.line : colors.highlightLine,
        backgroundColor: colors.bg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        gap: space[4],
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <View
            style={{
              position: "absolute",
              right: space[6],
              bottom: space[6],
              width: CHANGE_BADGE_SIZE,
              height: CHANGE_BADGE_SIZE,
              borderRadius: radius.full,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="camera-outline" size={CHANGE_ICON_SIZE} color={colors.accent} />
          </View>
        </>
      ) : (
        <>
          <Ionicons name="camera-outline" size={PHOTO_ICON_SIZE} color={colors.accent} />
          <Text variant="captionSm" color="textMuted">
            {t("item.addPhoto")}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** 지금 고른 폴더. 누르면 폴더 선택 시트를 연다 */
function FolderRow({ folderId, onPress }: { folderId: string | undefined; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors, folders: folderColors } = useTheme();
  const folders = useFolders();
  const folder = pickedFolder(folders.data, folderId);
  const name = folder ? folderName(folder, t) : "";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t("item.folderLabel")}, ${name}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space[12],
        height: FOLDER_ROW_HEIGHT,
        paddingHorizontal: space[14],
        borderRadius: radius.field,
        borderWidth: border.default,
        borderColor: colors.line,
        backgroundColor: colors.surface,
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      {folder ? (
        <FolderIcon
          size={FOLDER_ICON_SIZE}
          color={folderIconColor(folderColors, folders.data ?? [], folder)}
        />
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="captionSm" color="textMuted">
          {t("item.folderLabel")}
        </Text>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={CHEVRON_SIZE} color={colors.textMuted} />
    </Pressable>
  );
}
