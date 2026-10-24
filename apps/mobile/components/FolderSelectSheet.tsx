import { Ionicons } from "@expo/vector-icons";
import { useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View, type TextInput } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import type { Folder } from "@deckodecko/core";
import {
  useCreateFolder,
  useFolders,
  useIsFolderNameTaken,
  useItemCountsByFolder,
} from "@deckodecko/core/react";
import { border, folderColor, radius, space, useTheme, type FolderColor } from "@deckodecko/ui";
import {
  BottomSheet,
  Button,
  IconButton,
  Input,
  PRESSED_OPACITY,
  Text,
} from "@deckodecko/ui/native";

import { formatFolderItemCount } from "@/lib/i18n";

/** 머리글 원형 버튼 지름 */
const HEADER_BUTTON_SIZE = 36;
/** 머리글 버튼 안 아이콘 */
const HEADER_ICON_SIZE = 18;
/** 폴더 행 높이 */
const ROW_HEIGHT = 56;
/** 폴더 행 왼쪽 아이콘 */
const FOLDER_ICON_SIZE = 22;
/** 선택된 행 오른쪽 체크 */
const CHECK_SIZE = 20;
/** 폴더가 많을 때 목록이 차지하는 최대 높이 (화면 높이 대비). 넘치면 목록만 스크롤한다 */
const LIST_MAX_HEIGHT_RATIO = 0.3;

type Props = {
  open: boolean;
  /** 뒤로 · 아래로 끌기 · 뒤 배경으로 닫았을 때. 여기서 open 을 false 로 바꾼다 */
  onClose: () => void;
  /** 지금 고른 폴더 (아이템 시트의 값) */
  selectedFolderId: string | undefined;
  /** 목록에서 폴더를 골랐을 때. 값을 바꾸고 open 을 false 로 바꿔 아이템 시트로 돌아간다 */
  onSelect: (folderId: string) => void;
};

/** 아이템 시트에서 여는 폴더 선택 시트 (시안 B_FolderSheet). 새 폴더는 목록에 더하기만 하고, 고르는 건 목록에서 한다. */
export function FolderSelectSheet({ open, onClose, selectedFolderId, onSelect }: Props) {
  const { t } = useTranslation();
  const { colors, folders: folderColors } = useTheme();
  const { height } = useWindowDimensions();
  const folders = useFolders();
  const counts = useItemCountsByFolder();
  // 폴더 색은 기본 폴더를 뺀 목록 순서로 돌린다
  const userFolderIds = (folders.data ?? []).filter((f) => !f.isDefault).map((f) => f.id);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<ScrollView>(null);
  // 새 폴더를 만든 뒤 목록이 다시 그려지면 맨 아래(새 폴더)로 내린다
  const scrollToNew = useRef(false);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <IconButton size={HEADER_BUTTON_SIZE} label={t("common.back")} onPress={onClose}>
          <Ionicons name="chevron-back" size={HEADER_ICON_SIZE} color={colors.textMuted} />
        </IconButton>
        <Text variant="headingSm" accessibilityRole="header">
          {t("folder.selectTitle")}
        </Text>
        {/* 새 폴더: 아래 이름 입력창으로 바로 간다 */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          accessibilityRole="button"
          accessibilityLabel={t("folder.newFolder")}
          hitSlop={space[4]}
          style={({ pressed }) => ({
            width: HEADER_BUTTON_SIZE,
            height: HEADER_BUTTON_SIZE,
            borderRadius: radius.full,
            backgroundColor: colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <Ionicons name="add" size={HEADER_ICON_SIZE} color={colors.accent} />
        </Pressable>
      </View>

      {folders.isError ? (
        <Text color="textMuted">{t("common.loadFailed")}</Text>
      ) : (
        // BottomSheetScrollView 는 쓰지 않는다. 시트 높이를 목록 높이로 덮어써서 머리글 · 입력창이 잘린다 (@gorhom/bottom-sheet 5.2)
        <ScrollView
          style={{ maxHeight: height * LIST_MAX_HEIGHT_RATIO, flexGrow: 0 }}
          ref={listRef}
          contentContainerStyle={{ gap: space[8] }}
          onContentSizeChange={() => {
            if (!scrollToNew.current) return;
            scrollToNew.current = false;
            listRef.current?.scrollToEnd();
          }}
        >
          {folders.data?.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              color={folderColor(folderColors, folder, userFolderIds.indexOf(folder.id))}
              count={counts.data?.[folder.id] ?? 0}
              selected={folder.id === selectedFolderId}
              onPress={() => onSelect(folder.id)}
            />
          ))}
        </ScrollView>
      )}

      <NewFolderForm
        inputRef={inputRef}
        onCreated={() => {
          scrollToNew.current = true;
        }}
      />
    </BottomSheet>
  );
}

function FolderRow({
  folder,
  color,
  count,
  selected,
  onPress,
}: {
  folder: Folder;
  color: FolderColor;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space[12],
        height: ROW_HEIGHT,
        paddingHorizontal: space[14],
        borderRadius: radius.field,
        borderWidth: border.default,
        borderColor: selected ? colors.primary : colors.line,
        backgroundColor: selected ? colors.bg : colors.surface,
        opacity: pressed ? PRESSED_OPACITY : 1,
      })}
    >
      {/* 면과 선을 다른 색으로 그리려고 채운 아이콘 위에 선 아이콘을 겹친다 */}
      <View>
        <Ionicons name="folder" size={FOLDER_ICON_SIZE} color={color.fill} />
        <Ionicons
          name="folder-outline"
          size={FOLDER_ICON_SIZE}
          color={color.stroke}
          style={{ position: "absolute" }}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyStrong" color={selected ? "accent" : "text"} numberOfLines={1}>
          {folder.isDefault ? t("folder.defaultName") : folder.name}
        </Text>
        <Text variant="captionSm" color="textMuted">
          {formatFolderItemCount(count)}
        </Text>
      </View>
      {selected ? <Ionicons name="checkmark" size={CHECK_SIZE} color={colors.accent} /> : null}
    </Pressable>
  );
}

/** 이름 입력 + 만들기. 같은 이름이 있으면 만들기를 막는다 */
function NewFolderForm({
  inputRef,
  onCreated,
}: {
  inputRef: RefObject<TextInput | null>;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const taken = useIsFolderNameTaken(name);
  const create = useCreateFolder();

  const filled = name.trim().length > 0;
  // 중복 검사 결과가 오기 전에는 만들지 않는다 (저장소는 중복을 막지 않는다)
  const canCreate = filled && taken.data === false && !create.isPending;

  const submit = async () => {
    if (!canCreate) return;
    try {
      await create.mutateAsync(name);
      setName("");
      onCreated();
    } catch {
      // 안내는 create.error 로 아래에 보인다
    }
  };

  const message =
    filled && taken.data
      ? { text: t("folder.nameTaken"), color: "accent" as const }
      : create.isError
        ? { text: t("folder.createFailed"), color: "accent" as const }
        : { text: t("folder.nameHint"), color: "textMuted" as const };

  return (
    <View style={{ gap: space[6], paddingTop: space[4] }}>
      <Text variant="caption" weight="bold" color="textMuted">
        {t("folder.createLabel")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space[8] }}>
        <Input
          ref={inputRef}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (create.isError) create.reset();
          }}
          placeholder={t("folder.namePlaceholder")}
          accessibilityLabel={t("folder.createLabel")}
          clearable={false}
          returnKeyType="done"
          onSubmitEditing={submit}
          style={{ flex: 1 }}
        />
        <Button size="md" disabled={!canCreate} onPress={submit}>
          {t("folder.create")}
        </Button>
      </View>
      <Text variant="captionSm" color={message.color} accessibilityLiveRegion="polite">
        {message.text}
      </Text>
    </View>
  );
}
