import { useScrollToTop } from "expo-router";
import { useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FlatList, Pressable, ScrollView, View, type ListRenderItemInfo } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import {
  GACHA_DEFAULTS,
  releaseStatus,
  toYearMonth,
  type Gacha,
  type GachaFilter,
  type GachaReleaseFilter,
  type GachaSort,
} from "@deckodecko/core";
import { useGachaSearchPages, usePopularGacha } from "@deckodecko/core/react";
import { gutter, space } from "@deckodecko/ui";
import { Button, ChevronDownIcon, Chip, PRESSED_OPACITY, Text } from "@deckodecko/ui/native";

import { EmptyState } from "@/components/EmptyState";
import { GachaCardSlot } from "@/components/GachaCardSlot";
import { OptionSheet } from "@/components/OptionSheet";
import { QueryState } from "@/components/QueryState";
import { StateMessage } from "@/components/StateMessage";
import { mediaTitle } from "@/lib/displayName";
import {
  findPriceRange,
  PRICE_RANGES,
  priceRangeLabel,
  RELEASE_FILTERS,
  SORTS,
} from "@/lib/searchFilters";

/** 칩 펼침 표시(⌄) */
const CHEVRON_SIZE = 14;
/** 정렬 버튼은 글자만 있어 작으므로 누를 수 있는 높이를 따로 둔다 */
const SORT_BUTTON_MIN_HEIGHT = 44;
/** 목록 끝에서 이만큼(화면 높이 비율) 남았을 때 다음 페이지를 부른다 */
const END_REACHED_THRESHOLD = 0.5;
/** 가격 시트에서 "가격 전체" 의 값 */
const ANY_PRICE = "any";
/** 결과 없음 안내가 나타나는 시간(ms). 로딩 문구에서 갑자기 바뀌지 않게. "동작 줄이기"가 켜져 있으면 Reanimated 가 건너뛴다 */
const EMPTY_FADE_DURATION = 200;
/** 결과 없음의 추천 검색어 칩 수 */
const SUGGESTION_COUNT = 3;

type Sheet = "sort" | "price" | null;

/**
 * 검색 결과: 필터 칩 · 총 개수 · 정렬 · 무한 스크롤(10개씩) 목록. 결과가 없으면 가운데 안내
 * (필터가 걸려 있으면 필터 초기화, 아니면 등록 요청).
 * 칩 "전체 · 신상품 · 발매 예정" 은 발매 시기(하나만 고름), 작품 · 가격은 시트에서 고른다.
 * 필터 · 정렬은 검색어를 바꿔도 유지하고, 검색어를 비워 이 목록이 사라지면 처음으로 돌아간다.
 * onSearch: 결과 없음의 추천 검색어 칩을 눌렀을 때 그 검색어로 다시 검색한다.
 */
export function SearchResultList({
  keyword,
  onSearch,
}: {
  keyword: string;
  onSearch: (keyword: string) => void;
}) {
  const { t } = useTranslation();
  const listRef = useRef<FlatList<Gacha>>(null);
  useScrollToTop(listRef);
  const [release, setRelease] = useState<GachaReleaseFilter>("all");
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sort, setSort] = useState<GachaSort>(GACHA_DEFAULTS.searchSort);
  const [sheet, setSheet] = useState<Sheet>(null);

  const filter: GachaFilter = { release, priceMin, priceMax };
  const priceRange = findPriceRange(filter);
  const hasPrice = priceMin != null || priceMax != null;
  const hasFilter = release !== "all" || hasPrice;
  // 정렬은 결과 수를 바꾸지 않으므로 그대로 둔다
  const resetFilter = () => {
    setRelease("all");
    setPriceMin(null);
    setPriceMax(null);
  };
  const search = useGachaSearchPages(keyword, { filter, sort });
  // 새 검색어 · 필터 · 정렬을 불러오는 동안에는 이전 조건의 결과 · 개수를 보이지 않는다 (목록이 비면 QueryState 가 로딩 · 오프라인 안내를 그린다)
  const result = search.isPlaceholderData ? undefined : search.data;

  const loadMore = () => {
    // 이전 조건의 결과를 보여 주는 동안(placeholder)이나 다음 페이지가 실패한 뒤에는 저절로 부르지 않는다 (실패는 아래 다시 시도 버튼으로)
    if (
      search.hasNextPage &&
      !search.isFetchingNextPage &&
      !search.isFetchNextPageError &&
      !search.isPlaceholderData
    ) {
      void search.fetchNextPage();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space[6], gap: space[8] }}
      >
        {RELEASE_FILTERS.map((value) => (
          <Chip key={value} selected={release === value} onPress={() => setRelease(value)}>
            {t(`search.filter.${value}`)}
          </Chip>
        ))}
        {/* TODO(혜진): 작품 목록 조회(저장소 · 훅)가 생기면 작품 고르기 시트를 붙인다 */}
        <Chip disabled trailing={<ChevronDownIcon size={CHEVRON_SIZE} color="text" />}>
          {t("search.filter.media")}
        </Chip>
        <Chip
          selected={hasPrice}
          onPress={() => setSheet("price")}
          trailing={<ChevronDownIcon size={CHEVRON_SIZE} color={hasPrice ? "onPrimary" : "text"} />}
        >
          {hasPrice ? priceRangeLabel({ min: priceMin, max: priceMax }) : t("search.filter.price")}
        </Chip>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: gutter,
        }}
      >
        {result ? (
          // parent 로 넘기면 Trans 가 번역 조각을 ResultCountText 의 직접 자식으로 주므로 Text 가 글자별 글꼴을 나눌 수 있다.
          <Trans
            parent={ResultCountText}
            i18nKey="search.resultCount"
            count={result.total}
            components={{ bold: <Text variant="label" weight="bold" /> }}
          />
        ) : (
          <View />
        )}
        <Pressable
          onPress={() => setSheet("sort")}
          accessibilityRole="button"
          accessibilityLabel={`${t("search.sortTitle")}, ${t(`search.sort.${sort}`)}`}
          hitSlop={space[8]}
          style={({ pressed }) => ({
            minHeight: SORT_BUTTON_MIN_HEIGHT,
            flexDirection: "row",
            alignItems: "center",
            gap: space[4],
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <Text variant="label" weight="regular" color="textMuted">
            {t(`search.sort.${sort}`)}
          </Text>
          <ChevronDownIcon size={CHEVRON_SIZE} color="textMuted" />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={result?.items ?? []}
        keyExtractor={(gacha) => gacha.id}
        renderItem={renderResult}
        onEndReached={loadMore}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        ListFooterComponent={
          search.isFetchingNextPage ? (
            <StateMessage loading message={t("common.loading")} />
          ) : search.isFetchNextPageError ? (
            <StateMessage
              message={t("common.loadFailed")}
              onRetry={() => void search.fetchNextPage()}
            />
          ) : null
        }
        // 결과가 있으면 그려지지 않으므로 로딩 · 에러 · 결과 없음만 여기서 고른다
        ListEmptyComponent={
          <QueryState
            query={search}
            isEmpty={(page) => page.items.length === 0}
            empty={
              <Animated.View entering={FadeIn.duration(EMPTY_FADE_DURATION)} style={{ flex: 1 }}>
                {hasFilter ? (
                  // 필터 때문에 0개면 미등록 가챠가 아니므로 등록 요청 대신 필터를 풀게 한다
                  <EmptyState
                    icon="filter"
                    title={t("search.noFilteredResult")}
                    description={t("search.noFilteredResultHint")}
                    action={
                      <Button
                        variant="outline"
                        size="md"
                        onPress={resetFilter}
                        style={{ alignSelf: "center" }}
                      >
                        {t("search.resetFilters")}
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon="search"
                    title={t("search.noResult", { keyword })}
                    description={t("search.noResultHint")}
                    action={
                      <View style={{ alignItems: "center", gap: space[18] }}>
                        <SuggestedSearches onSelect={onSearch} />
                        {/* TODO(혜진): 등록 요청 화면이 생기면 연결한다. 그 전까지는 자리만 두고 누를 수 없다. */}
                        <Button
                          variant="outline"
                          size="md"
                          disabled
                          style={{ alignSelf: "center" }}
                        >
                          {t("search.requestRegistration")}
                        </Button>
                      </View>
                    }
                  />
                )}
              </Animated.View>
            }
          >
            {() => null}
          </QueryState>
        }
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: gutter, paddingBottom: space[24] }}
      />

      <OptionSheet
        open={sheet === "sort"}
        onClose={() => setSheet(null)}
        title={t("search.sortTitle")}
        options={SORTS.map((value) => ({ value, label: t(`search.sort.${value}`) }))}
        value={sort}
        onSelect={(value) => {
          setSort(value);
          setSheet(null);
        }}
      />
      <OptionSheet
        open={sheet === "price"}
        onClose={() => setSheet(null)}
        title={t("search.filter.price")}
        options={[
          { value: ANY_PRICE, label: t("search.priceRange.any") },
          ...PRICE_RANGES.map((range) => ({ value: range.id, label: priceRangeLabel(range) })),
        ]}
        value={priceRange?.id ?? ANY_PRICE}
        onSelect={(id) => {
          const range = PRICE_RANGES.find((r) => r.id === id);
          setPriceMin(range?.min ?? null);
          setPriceMax(range?.max ?? null);
          setSheet(null);
        }}
      />
    </View>
  );
}

// 모듈에 두어 참조를 고정한다 (FlatList 가 목록이 다시 그려질 때 줄을 모두 다시 그리지 않게)
function renderResult({ item }: ListRenderItemInfo<Gacha>) {
  return (
    <GachaCardSlot
      gacha={item}
      layout="horizontal"
      releaseStatus={releaseStatus(item.releaseMonth, toYearMonth(new Date()))}
    />
  );
}

/** 결과 없음의 "이렇게 검색해 보세요": 인기 가챠의 작품명을 겹치지 않게 앞에서부터. 작품명이 하나도 없으면 그리지 않는다. */
function SuggestedSearches({ onSelect }: { onSelect: (keyword: string) => void }) {
  const { t, i18n } = useTranslation();
  const popular = usePopularGacha();
  const titles = [
    ...new Set(
      (popular.data ?? []).flatMap((g) => (g.media ? [mediaTitle(g.media, i18n.language)] : []))
    ),
  ].slice(0, SUGGESTION_COUNT);
  if (titles.length === 0) return null;

  return (
    <View style={{ alignItems: "center", gap: space[8] }}>
      <Text variant="caption" color="textMuted">
        {t("search.suggestionTitle")}
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: space[8] }}
      >
        {titles.map((title) => (
          <Chip key={title} onPress={() => onSelect(title)}>
            {title}
          </Chip>
        ))}
      </View>
    </View>
  );
}

/** 결과 수 한 줄 ("총 N개"). Trans 의 parent. */
function ResultCountText({ children }: { children?: ReactNode }) {
  return (
    <Text variant="label" weight="regular" color="textMuted">
      {children}
    </Text>
  );
}

function Separator() {
  return <View style={{ height: space[10] }} />;
}
