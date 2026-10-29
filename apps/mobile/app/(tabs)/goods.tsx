import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  collectionRate,
  DEFAULT_GOODS_VIEW_MODE,
  type Folder,
  type Gacha,
  type Item,
  type ItemCounts,
  type ItemType,
} from "@deckodecko/core";
import {
  useFolders,
  useGachasByIds,
  useGoodsViewMode,
  useItemCounts,
  useItems,
  useSetGoodsViewMode,
} from "@deckodecko/core/react";
import { border, gutter, space, useTheme } from "@deckodecko/ui";
import { Button, Chip, PRESSED_OPACITY, Segment, Text, useToast } from "@deckodecko/ui/native";

import { EmptyState } from "@/components/EmptyState";
import { GoodsGachaRow } from "@/components/GoodsGachaRow";
import { GoodsItemCard } from "@/components/GoodsItemCard";
import { GoodsSearchField } from "@/components/GoodsSearchField";
import { GoodsViewToggle } from "@/components/GoodsViewToggle";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { ItemSheet } from "@/components/ItemSheet";
import { QueryState } from "@/components/QueryState";
import { StateMessage } from "@/components/StateMessage";
import { folderName, gachaName } from "@/lib/displayName";
import { countByFolder, groupByGacha, searchGoods } from "@/lib/goods";
import { formatPercent } from "@/lib/i18n";
import { openGacha } from "@/lib/routes";

/** 풀어보기 그리드의 열 수 · 카드 사이 간격 */
const GRID_COLUMNS = 2;
const GRID_GAP = space[12];
/** 빈 화면 "가챠 찾아보기" 버튼의 돋보기 */
const FIND_ICON_SIZE = 18;

const NO_GACHAS: ReadonlyMap<string, Gacha> = new Map();

// TODO(혜진): 폴더 관리 화면이 생기면 연결한다. 그 전까지는 눌러도 아무 일도 없다.
function openFolderManage() {}

/**
 * 내 굿즈. WISH · GET 세그먼트 · 폴더 칩 · 목록 검색 · 풀어보기(아이템 그리드) / 묶어보기(가챠별 줄).
 * 세그먼트를 바꾸면 폴더는 "전체"로 돌아간다. 검색어는 그대로 둔다.
 * 기록이 하나도 없으면 칩 · 검색 대신 빈 화면 안내를 그린다.
 */
export default function GoodsScreen() {
  const counts = useItemCounts();
  const [type, setType] = useState<ItemType>("GET");
  const [folderId, setFolderId] = useState<string | null>(null);
  // 시트는 빈 화면 분기 밖에 둔다. 마지막 기록을 지워 빈 화면으로 바뀌어도 닫히는 시트가 끝까지 그려지게
  const { openSheet, sheet } = useEditSheet();

  function changeType(next: ItemType) {
    setType(next);
    setFolderId(null);
  }

  return (
    <View style={{ flex: 1 }}>
      <GoodsHeader counts={counts.data} type={type} onChangeType={changeType} />
      <QueryState query={counts} fill isEmpty={(c) => c.wish + c.get === 0} empty={<GoodsEmpty />}>
        {() => (
          <GoodsBody
            type={type}
            folderId={folderId}
            onChangeFolder={setFolderId}
            onPressItem={openSheet}
          />
        )}
      </QueryState>
      {sheet}
    </View>
  );
}

function GoodsHeader({
  counts,
  type,
  onChangeType,
}: {
  counts: ItemCounts | undefined;
  type: ItemType;
  onChangeType: (type: ItemType) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const total = counts ? counts.wish + counts.get : 0;
  const summary =
    counts == null
      ? ""
      : total === 0
        ? t("goods.summaryEmpty")
        : t("goods.summary", { count: total, rate: formatPercent(collectionRate(counts)) });

  return (
    <View
      style={{
        paddingTop: insets.top + space[24],
        paddingHorizontal: gutter,
        paddingBottom: space[14],
        gap: space[14],
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ gap: space[2] }}>
          <Text variant="caption" color="textMuted">
            {summary}
          </Text>
          <Text variant="headingMd" accessibilityRole="header">
            {t("goods.title")}
          </Text>
        </View>
        <HeaderIconButton
          icon="folder-open-outline"
          variant="outline"
          label={t("goods.manageFolders")}
          onPress={openFolderManage}
        />
      </View>
      <Segment
        options={[
          { value: "WISH", label: t("goods.wishTab", { count: counts?.wish ?? 0 }), tone: "wish" },
          { value: "GET", label: t("goods.getTab", { count: counts?.get ?? 0 }), tone: "get" },
        ]}
        value={type}
        onChange={onChangeType}
        accessibilityLabel={t("goods.typeLabel")}
        style={{
          backgroundColor: colors.surface,
          borderWidth: border.default,
          borderColor: colors.line,
        }}
      />
    </View>
  );
}

/** 기록이 하나도 없을 때 (시안 B_MyGoodsEmpty) */
function GoodsEmpty() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <EmptyState
      icon="albums-outline"
      title={t("goods.emptyTitle")}
      description={t("goods.emptyDescription")}
    >
      <View style={{ alignItems: "center", gap: space[14] }}>
        <Button
          size="md"
          icon={<Ionicons name="search" size={FIND_ICON_SIZE} color={colors.onPrimary} />}
          onPress={() => router.navigate("/search")}
        >
          {t("goods.findGacha")}
        </Button>
        <Pressable
          onPress={() => router.navigate("/")}
          accessibilityRole="link"
          hitSlop={space[8]}
          style={({ pressed }) => ({ opacity: pressed ? PRESSED_OPACITY : 1 })}
        >
          <Text variant="label" weight="regular" color="textMuted">
            {t("goods.browseHome")}
          </Text>
        </Pressable>
      </View>
    </EmptyState>
  );
}

type BodyProps = {
  type: ItemType;
  folderId: string | null;
  onChangeFolder: (folderId: string | null) => void;
  onPressItem: (item: Item) => void;
};

function GoodsBody({ type, folderId, onChangeFolder, onPressItem }: BodyProps) {
  const { t } = useTranslation();
  const folders = useFolders();
  // 고른 폴더가 지워졌으면 "전체"로 본다
  const selectedFolder =
    folderId != null && folders.data?.some((f) => f.id === folderId) ? folderId : null;
  const items = useItems({ type, folderId: selectedFolder ?? undefined });
  // 가챠 id 는 거르기 전 전체 기록에서 뽑는다. 세그먼트 · 폴더를 바꿔도 키가 같아 다시 요청하지 않는다
  const allItems = useItems();
  const gachaIds = useMemo(() => (allItems.data ?? []).map((i) => i.gachaId), [allItems.data]);
  const gachas = useGachasByIds(gachaIds);
  const viewMode = useGoodsViewMode();
  const setViewMode = useSetGoodsViewMode();
  const [keyword, setKeyword] = useState("");

  const gachaMap = gachas.data ?? NO_GACHAS;
  const filtered = useMemo(
    () => searchGoods(items.data ?? [], gachaMap, keyword),
    [items.data, gachaMap, keyword]
  );

  return (
    <View style={{ flex: 1 }}>
      <FolderChips
        folders={folders.data ?? []}
        selected={selectedFolder}
        onSelect={onChangeFolder}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: space[10],
          paddingTop: space[6],
          paddingBottom: space[10],
          paddingHorizontal: gutter,
        }}
      >
        <GoodsSearchField value={keyword} onChangeText={setKeyword} style={{ flex: 1 }} />
        <GoodsViewToggle
          value={viewMode.data ?? DEFAULT_GOODS_VIEW_MODE}
          onChange={(mode) => setViewMode.mutate(mode)}
        />
      </View>
      {/* 기록은 로컬이라 목록은 그대로 보여 주고, 가챠 이름 · 이미지만 비는 것을 알린다 */}
      {gachas.isError && (
        <StateMessage message={t("goods.gachaLoadFailed")} onRetry={() => void gachas.refetch()} />
      )}
      {/* 저장된 보기 방식을 읽기 전에 기본 방식으로 그리면, 묶어보기를 고른 사람에게 그리드가 잠깐 보인다 */}
      <QueryState
        query={{
          data: items.data,
          isLoading: items.isLoading || viewMode.isLoading,
          isError: items.isError,
          refetch: items.refetch,
        }}
        fill
        isEmpty={() => filtered.length === 0}
        empty={
          <StateMessage
            message={
              keyword.trim()
                ? t("goods.noSearchResult", { keyword: keyword.trim() })
                : t("goods.noMatch")
            }
          />
        }
      >
        {() =>
          (viewMode.data ?? DEFAULT_GOODS_VIEW_MODE) === "gachas" ? (
            <GachaList
              items={filtered}
              type={type}
              gachas={gachaMap}
              // 이전 id 의 결과(placeholder)로는 새 가챠를 "카탈로그에 없음"으로 보지 않는다
              gachasLoaded={gachas.data != null && !gachas.isPlaceholderData}
              folders={folders.data ?? []}
            />
          ) : (
            <ItemGrid
              items={filtered}
              gachas={gachaMap}
              folders={folders.data ?? []}
              onPressItem={onPressItem}
            />
          )
        }
      </QueryState>
    </View>
  );
}

/** "전체" + 폴더 칩 (폴더 목록 순서, 기본 폴더가 앞). 가로로 넘긴다. */
function FolderChips({
  folders,
  selected,
  onSelect,
}: {
  folders: Folder[];
  selected: string | null;
  onSelect: (folderId: string | null) => void;
}) {
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

/** 폴더 id → 표시 이름 */
function useFolderNames(folders: Folder[]) {
  const { t } = useTranslation();
  return useMemo(() => new Map(folders.map((f) => [f.id, folderName(f, t)])), [folders, t]);
}

/** 수정 시트를 열고, 저장에 실패하면 "다시 열기" 토스트를 띄운다 */
function useEditSheet() {
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

/** 풀어보기: 아이템 카드 2열. 누르면 수정 시트 */
function ItemGrid({
  items,
  gachas,
  folders,
  onPressItem,
}: {
  items: Item[];
  gachas: ReadonlyMap<string, Gacha>;
  folders: Folder[];
  onPressItem: (item: Item) => void;
}) {
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const folderNames = useFolderNames(folders);
  const cardWidth = (width - gutter * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      renderItem={({ item }) => {
        const gacha = gachas.get(item.gachaId);
        return (
          <GoodsItemCard
            item={item}
            folder={folderNames.get(item.folderId) ?? null}
            gacha={gacha ? gachaName(gacha, i18n.language) : null}
            gachaImageUrl={gacha?.imageUrl ?? null}
            onPress={() => onPressItem(item)}
            style={{ width: cardWidth }}
          />
        );
      }}
      columnWrapperStyle={{ gap: GRID_GAP }}
      contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: space[24], gap: GRID_GAP }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

/** 묶어보기: 가챠별 한 줄 (최근에 기록한 가챠부터). 누르면 상세 */
function GachaList({
  items,
  type,
  gachas,
  gachasLoaded,
  folders,
}: {
  items: Item[];
  type: ItemType;
  gachas: ReadonlyMap<string, Gacha>;
  /** 가챠 정보를 한 번이라도 받았는지. 받기 전에는 없는 가챠로 보지 않는다 */
  gachasLoaded: boolean;
  folders: Folder[];
}) {
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
