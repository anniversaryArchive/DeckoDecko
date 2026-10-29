import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddRecentSearch, usePopularGacha } from "@deckodecko/core/react";
import { gutter, space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { PopularGachaList } from "@/components/PopularGachaList";
import { QueryState } from "@/components/QueryState";
import {
  RecentGachaSection,
  RecentSearchesSection,
  useRecentMotion,
} from "@/components/RecentSections";
import { SearchBar } from "@/components/SearchBar";
import { SearchResultList } from "@/components/SearchResultList";
import { SectionHeader } from "@/components/SectionHeader";
import { StateMessage } from "@/components/StateMessage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate } from "@/lib/i18n";

/**
 * 검색. 상단(제목 + 입력창)은 고정이고, 아래 영역이 검색어 유무에 따라 검색 전 화면(최근 기록 · 인기) ↔ 결과 목록으로 바뀐다.
 * 타이핑은 300ms 디바운스, 검색 버튼 · 키보드 검색은 즉시. 결과 목록(필터 · 정렬 · 무한 스크롤)은 SearchResultList.
 * 최근 검색어는 검색 버튼 · 키보드 검색 · 최근 검색어 칩으로 확정한 검색어만 남긴다 (타이핑 중 디바운스 검색은 남기지 않는다).
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
  const addRecentSearch = useAddRecentSearch();

  const search = (text: string) => {
    const next = text.trim();
    setSubmitted(next);
    if (next) addRecentSearch.mutate(next);
    Keyboard.dismiss();
  };
  const submit = () => search(input);
  // 최근 검색어 · 추천 검색어 칩: 입력창을 그 검색어로 채우고 바로 검색한다
  const searchRecent = (text: string) => {
    setInput(text);
    search(text);
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
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <Text variant="headingMd" accessibilityRole="header">
            {t("search.title")}
          </Text>
          {/* 신상품 · 발매 예정 · NEW 배지가 오늘(기기 시간) 기준이라 결과를 볼 때만 알린다 */}
          {keyword ? (
            <Text variant="caption" color="textMuted">
              {t("search.asOf", { date: formatDate(new Date()) })}
            </Text>
          ) : null}
        </View>
        <SearchBar value={input} onChangeText={setInput} onSubmit={submit} />
      </View>

      {keyword ? (
        <SearchResultList keyword={keyword} onSearch={searchRecent} />
      ) : (
        <BeforeSearch onSelectRecent={searchRecent} />
      )}
    </View>
  );
}

function isEmpty(value: string) {
  return value === "";
}

/**
 * 검색어가 없을 때: 최근 검색어 · 최근 본 굿즈(기록이 있을 때만) · 인기 검색 굿즈.
 * 섹션마다 좌우 여백을 준다 (최근 섹션의 가로 스크롤이 화면 끝까지 닿아야 해서).
 */
function BeforeSearch({ onSelectRecent }: { onSelectRecent: (keyword: string) => void }) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingTop: space[14], paddingBottom: space[24], gap: space[24] }}
    >
      <RecentSearchesSection onSelect={onSelectRecent} />
      <RecentGachaSection />
      <PopularSearches />
    </ScrollView>
  );
}

function PopularSearches() {
  const { t } = useTranslation();
  const popular = usePopularGacha();
  const { layout } = useRecentMotion();
  // 위의 최근 섹션이 생기고 없어질 때 같이 미끄러진다
  return (
    <Animated.View layout={layout} style={{ paddingHorizontal: gutter, gap: space[10] }}>
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
    </Animated.View>
  );
}
