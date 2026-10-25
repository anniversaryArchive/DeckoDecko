import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionSheetIOS, Alert, Image, Keyboard, Platform, Pressable, View } from "react-native";

import type { Item, ItemType } from "@deckodecko/core";
import {
  useCreateItem,
  useFolders,
  useIsItemNameTaken,
  useItem,
  useUpdateItem,
} from "@deckodecko/core/react";
import { border, folderColor, radius, space, useTheme } from "@deckodecko/ui";
import { BottomSheet, Button, Input, PRESSED_OPACITY, Segment, Text } from "@deckodecko/ui/native";

import { FolderIcon } from "@/components/FolderIcon";
import { FolderSelectSheet } from "@/components/FolderSelectSheet";
import { ItemDeleteSheet } from "@/components/ItemDeleteSheet";
import { formatDate } from "@/lib/i18n";

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
/** 키보드가 내려갔다는 알림이 오지 않을 때 위 시트(폴더 선택 · 삭제 확인)를 열기까지 기다리는 최대 시간(ms) */
const KEYBOARD_HIDE_TIMEOUT = 500;

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

function formFromItem(item: Item): Form {
  return {
    type: item.type,
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
};

/**
 * 상세에서 여는 아이템 추가 · 수정 시트 (시안 B_ItemSheet · B_ItemSheetEdit).
 * 열 때마다 입력을 새로 채운다: 추가는 빈 값, 수정은 저장된 기록.
 * 폴더 선택 · 삭제 확인은 이 시트 위에 여는 시트다 (시안 B_FolderSheet · B_ItemDelete).
 */
export function ItemSheet({ open, onClose, gachaId, itemId }: Props) {
  const { t } = useTranslation();
  const item = useItem(itemId);
  const folders = useFolders();
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  // 키보드가 내려가길 기다리는 중이면, 그 기다림을 취소하는 함수. 여러 번 눌러도 한 번만 기다린다.
  const cancelPendingOpen = useRef<(() => void) | null>(null);

  // 키보드를 먼저 내리고, 다 내려간 뒤에 위 시트를 연다.
  // 키보드가 떠 있을 때 열면 iOS 에서 라이브러리가 새 시트를 키보드 높이만큼 뺀 자리로 보내 시트가 보이지 않는다 (@gorhom/bottom-sheet 5.2).
  const openOver = useCallback((show: () => void) => {
    if (!Keyboard.isVisible()) {
      show();
      return;
    }
    if (cancelPendingOpen.current) return;
    const cancel = () => {
      sub.remove();
      clearTimeout(timer);
      cancelPendingOpen.current = null;
    };
    const finish = () => {
      cancel();
      show();
    };
    const sub = Keyboard.addListener("keyboardDidHide", finish);
    const timer = setTimeout(finish, KEYBOARD_HIDE_TIMEOUT);
    cancelPendingOpen.current = cancel;
    Keyboard.dismiss();
  }, []);

  // 기다리는 동안 시트가 닫히거나 화면을 나가면 열지 않는다
  useEffect(() => {
    if (!open) cancelPendingOpen.current?.();
  }, [open]);
  useEffect(() => () => cancelPendingOpen.current?.(), []);

  // 열릴 때마다 한 번 입력을 채운다. 수정은 기록을 불러온 뒤에 채운다.
  // 채울 때의 기록을 따로 들고 있어서, 저장 · 삭제 뒤 기록이 다시 불려도 닫히는 동안 내용이 바뀌지 않는다.
  const [wasOpen, setWasOpen] = useState(open);
  const [filled, setFilled] = useState(false);
  const [editingItem, setEditingItem] = useState<Item>();
  // 열 때마다 입력 영역을 새로 그린다. 지난번 저장 · 삭제 실패 안내가 남지 않게
  const [session, setSession] = useState(0);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFilled(false);
      setSession((n) => n + 1);
    }
  }
  if (open && !filled && (!itemId || item.data)) {
    setFilled(true);
    setEditingItem(item.data ?? undefined);
    setForm(item.data ? formFromItem(item.data) : EMPTY_FORM);
  }

  // 열 때 정한 모드를 닫힐 때까지 유지한다. 닫는 동안 화면이 itemId 를 지워도 제목 · 버튼이 바뀌지 않는다
  const editing = filled ? editingItem !== undefined : itemId !== undefined;
  const defaultFolderId = folders.data?.find((f) => f.isDefault)?.id;

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
            onOpenFolders={() => openOver(() => setFolderSheetOpen(true))}
            onDelete={() => openOver(() => setDeleteSheetOpen(true))}
            onDone={onClose}
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
        selectedFolderId={form.folderId ?? defaultFolderId}
        onSelect={(folderId) => {
          setForm((prev) => ({ ...prev, folderId }));
          setFolderSheetOpen(false);
        }}
      />

      {editingItem ? (
        <ItemDeleteSheet
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
}) {
  const { t } = useTranslation();
  const taken = useIsItemNameTaken(gachaId, form.name, item?.id);
  const create = useCreateItem();
  const update = useUpdateItem();

  const filled = form.name.trim().length > 0;
  const busy = create.isPending || update.isPending;
  // 중복 검사 결과가 오기 전에는 저장하지 않는다 (저장소는 중복을 막지 않는다)
  const canSave = filled && taken.data === false && !busy;

  const save = async () => {
    if (!canSave) return;
    const memo = form.memo.trim() || null;
    try {
      if (item) {
        await update.mutateAsync({
          id: item.id,
          input: {
            type: form.type,
            name: form.name,
            folderId: form.folderId,
            thumbnail: form.thumbnail,
            memo,
          },
        });
      } else {
        await create.mutateAsync({
          gachaId,
          type: form.type,
          name: form.name,
          folderId: form.folderId,
          thumbnail: form.thumbnail,
          memo,
        });
      }
      onDone();
    } catch {
      // 안내는 mutation 의 error 로 버튼 위에 보인다
    }
  };

  const nameMessage =
    filled && taken.data
      ? { text: t("item.nameTaken"), color: "accent" as const }
      : item
        ? {
            // 사진 수는 지금 입력 기준 (사진을 지우면 바로 빠진다)
            text: t(form.thumbnail ? "item.registeredWithPhoto" : "item.registered", {
              date: formatDate(new Date(item.createdAt)),
            }),
            color: "textMuted" as const,
          }
        : { text: t("item.nameHint"), color: "textMuted" as const };

  const failure = create.isError || update.isError ? t("item.saveFailed") : null;

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

      {failure ? (
        <Text variant="captionSm" color="accent" accessibilityLiveRegion="polite">
          {failure}
        </Text>
      ) : null}

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
 * 넘겨받은 주소는 선택기가 만든 임시 복사본이다. 앱 폴더로 옮겨 오래 두는 건 3주차 작업이다.
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
    const picked = result.canceled ? undefined : result.assets[0];
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
  const list = folders.data ?? [];
  const folder = list.find((f) => f.id === folderId) ?? list.find((f) => f.isDefault);
  const userFolderIds = list.filter((f) => !f.isDefault).map((f) => f.id);
  const name = folder ? (folder.isDefault ? t("folder.defaultName") : folder.name) : "";

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
          color={folderColor(folderColors, folder, userFolderIds.indexOf(folder.id))}
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
