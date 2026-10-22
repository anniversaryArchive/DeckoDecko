import { useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FlatList, Keyboard, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGachaSearch, usePopularGacha } from "@deckodecko/core/react";
import { gutter, space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { EmptyState } from "@/components/EmptyState";
import { GachaCardSlot } from "@/components/GachaCardSlot";
import { PopularGachaList } from "@/components/PopularGachaList";
import { QueryState } from "@/components/QueryState";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";
import { StateMessage } from "@/components/StateMessage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/**
 * 검색. 상단(제목 + 입력창)은 고정이고, 아래 영역이 검색어 유무에 따라 인기 목록 ↔ 결과 목록으로 바뀐다.
 * 타이핑은 300ms 디바운스, 검색 버튼 · 키보드 검색은 즉시. 최근 검색어 · 최근 본 굿즈 · 필터 · 정렬은 2주차.
 */
export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  // 검색 버튼으로 확정한 검색어. 입력이 그대로면 디바운스를 기다리지 않고 이 값을 쓴다.
  const [submitted, setSubmitted] = useState("");
  const trimmed = input.trim();
  // 입력을 비우면 디바운스 값도 바로 비운다. 안 그러면 지우고 300ms 안에 다시 칠 때 지우기 전 검색어의 결과가 잠깐 보인다.
  const debounced = useDebouncedValue(trimmed, 300, isEmpty);
  // 입력을 비우면 디바운스를 기다리지 않고 바로 인기 목록으로 돌아간다
  const keyword = !trimmed ? "" : submitted === trimmed ? submitted : debounced;

  const submit = () => {
    setSubmitted(trimmed);
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top + space[24],
          paddingHorizontal: gutter,
          paddingBottom: space[8],
          gap: space[14],
        }}
      >
        <Text variant="headingMd" accessibilityRole="header">
          {t("search.title")}
        </Text>
        <SearchBar value={input} onChangeText={setInput} onSubmit={submit} />
      </View>

      {keyword ? <SearchResults keyword={keyword} /> : <PopularSearches />}
    </View>
  );
}

function isEmpty(value: string) {
  return value === "";
}

/** 검색어가 없을 때: 인기 검색 굿즈. */
function PopularSearches() {
  const { t } = useTranslation();
  const popular = usePopularGacha();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{
        paddingTop: space[14],
        paddingHorizontal: gutter,
        paddingBottom: space[24],
        gap: space[10],
      }}
    >
      <SectionHeader
        title={t("search.popularTitle")}
        variant="titleMd"
        caption={t("common.last10Days")}
      />
      <QueryState
        query={popular}
        isEmpty={(list) => list.length === 0}
        empty={<StateMessage message={t("home.empty")} />}
      >
        {(list) => <PopularGachaList gachas={list} />}
      </QueryState>
    </ScrollView>
  );
}

/** 검색어가 있을 때: 결과 수 + 결과 카드 목록. 결과가 없으면 가운데 안내. */
function SearchResults({ keyword }: { keyword: string }) {
  const { t } = useTranslation();
  const search = useGachaSearch(keyword);

  return (
    <FlatList
      data={search.data?.items ?? []}
      keyExtractor={(gacha) => gacha.id}
      renderItem={({ item }) => <GachaCardSlot gacha={item} layout="horizontal" />}
      ListHeaderComponent={
        search.data ? (
          // parent 로 넘기면 Trans 가 번역 조각을 ResultCountText 의 직접 자식으로 주므로 Text 가 글자별 글꼴을 나눌 수 있다.
          <Trans
            parent={ResultCountText}
            i18nKey="search.resultCount"
            count={search.data.total}
            components={{ bold: <Text variant="label" weight="bold" /> }}
          />
        ) : null
      }
      // 결과가 있으면 그려지지 않으므로 로딩 · 에러 · 결과 없음만 여기서 고른다
      ListEmptyComponent={
        <QueryState
          query={search}
          isEmpty={(result) => result.items.length === 0}
          empty={
            <EmptyState
              icon="search"
              title={t("search.noResult", { keyword })}
              description={t("search.noResultHint")}
            />
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
  );
}

/** 결과 수 한 줄 ("총 N개"). Trans 의 parent. */
function ResultCountText({ children }: { children?: ReactNode }) {
  return (
    <Text
      variant="label"
      weight="regular"
      color="textMuted"
      style={{ paddingTop: space[6], paddingBottom: space[10] }}
    >
      {children}
    </Text>
  );
}

function Separator() {
  return <View style={{ height: space[10] }} />;
}
