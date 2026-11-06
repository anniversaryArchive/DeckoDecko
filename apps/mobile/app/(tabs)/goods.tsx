import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  collectionRate,
  DEFAULT_GOODS_VIEW_MODE,
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
import { Button, PRESSED_OPACITY, Segment, Text } from "@deckodecko/ui/native";

import { EmptyState } from "@/components/EmptyState";
import { GoodsFolderChips } from "@/components/GoodsFolderChips";
import { GoodsGachaList } from "@/components/GoodsGachaList";
import { GoodsItemGrid } from "@/components/GoodsItemGrid";
import { GoodsSearchField } from "@/components/GoodsSearchField";
import { GoodsViewToggle } from "@/components/GoodsViewToggle";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { QueryState } from "@/components/QueryState";
import { StateMessage } from "@/components/StateMessage";
import { useItemEditSheet } from "@/hooks/useItemEditSheet";
import { searchGoods } from "@/lib/goods";
import { formatPercent } from "@/lib/i18n";

/** 빈 화면 "가챠 찾아보기" 버튼의 돋보기 */
const FIND_ICON_SIZE = 18;

const NO_GACHAS: ReadonlyMap<string, Gacha> = new Map();

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
  const { openSheet, sheet } = useItemEditSheet();

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
          onPress={() => router.push("/folders")}
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
      action={
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
      }
    />
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
      <GoodsFolderChips
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
            <GoodsGachaList
              items={filtered}
              type={type}
              gachas={gachaMap}
              // 이전 id 의 결과(placeholder)로는 새 가챠를 "카탈로그에 없음"으로 보지 않는다
              gachasLoaded={gachas.data != null && !gachas.isPlaceholderData}
              folders={folders.data ?? []}
            />
          ) : (
            <GoodsItemGrid
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
