import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FlatList, Keyboard, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGachaSearch, usePopularGacha } from "@deckodecko/core/react";
import { border, fonts, gutter, radius, space, typography, useTheme } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { GachaResultCard } from "@/components/GachaResultCard";
import { RankedGachaList } from "@/components/RankedGachaList";
import { SectionHeader } from "@/components/SectionHeader";
import { StateMessage } from "@/components/StateMessage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/** 검색창 높이 */
const SEARCH_BAR_HEIGHT = 52;
/** 검색창 안 지우기 버튼(원형) 한 변 */
const CLEAR_BUTTON_SIZE = 32;
/** 검색창 안 검색 버튼 높이 */
const SUBMIT_BUTTON_HEIGHT = 40;
/** 결과 없음 원형 아이콘 한 변 */
const NO_RESULT_ICON_SIZE = 92;
/** 결과 없음 안내를 화면 가운데보다 조금 위로 올리는 값 */
const NO_RESULT_LIFT = 60;

/**
 * 검색. 상단(제목 + 입력창)은 고정이고, 아래 영역이 검색어 유무에 따라 인기 목록 ↔ 결과 목록으로 바뀐다.
 * 타이핑은 300ms 디바운스, 검색 버튼 · 키보드 검색은 즉시. 최근 검색어 · 최근 본 굿즈 · 필터 · 정렬은 2주차.
 */
export default function SearchScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: space[10],
            height: SEARCH_BAR_HEIGHT,
            borderRadius: radius.full,
            borderWidth: border.default,
            borderColor: colors.primary,
            backgroundColor: colors.surface,
            paddingLeft: space[18],
            paddingRight: space[6],
          }}
        >
          <Ionicons name="search" size={20} color={colors.accent} />
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={submit}
            placeholder={t("search.placeholder")}
            placeholderTextColor={colors.textPlaceholder}
            accessibilityLabel={t("search.placeholder")}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            // TextInput 은 Text 를 거치지 않으므로 글꼴 · 크기를 직접 준다 (입력 15 = titleSm 크기, 굵기는 regular).
            // 한 줄 입력창에 lineHeight 를 주면 Android 에서 글자가 위로 밀려 잘린다. 높이는 검색창이 정하고 글자는 가운데 둔다.
            style={{
              flex: 1,
              minWidth: 0,
              alignSelf: "stretch",
              paddingVertical: 0,
              textAlignVertical: "center",
              includeFontPadding: false,
              fontFamily: fonts.sans.regular,
              fontSize: typography.titleSm.fontSize,
              color: colors.text,
            }}
          />
          {input !== "" && (
            <Pressable
              onPress={() => setInput("")}
              accessibilityRole="button"
              accessibilityLabel={t("search.clear")}
              hitSlop={space[6]}
              style={{
                width: CLEAR_BUTTON_SIZE,
                height: CLEAR_BUTTON_SIZE,
                borderRadius: radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.bg,
              }}
            >
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          )}
          <Pressable
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel={t("search.submit")}
            hitSlop={{ top: space[2], bottom: space[2] }}
            style={({ pressed }) => ({
              height: SUBMIT_BUTTON_HEIGHT,
              paddingHorizontal: space[18],
              borderRadius: radius.full,
              justifyContent: "center",
              backgroundColor: colors.primary,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text variant="bodyStrong" color="onPrimary">
              {t("search.submit")}
            </Text>
          </Pressable>
        </View>
      </View>

      {keyword ? <SearchResults keyword={keyword} /> : <PopularSearches />}
    </View>
  );
}

function isEmpty(value: string) {
  return value === "";
}

/** 검색어가 없을 때: 인기 검색 굿즈 순위. */
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
      {popular.isPending ? (
        <StateMessage loading message={t("common.loading")} />
      ) : popular.isError ? (
        <StateMessage message={t("common.loadFailed")} />
      ) : popular.data.length === 0 ? (
        <StateMessage message={t("home.empty")} />
      ) : (
        <RankedGachaList gachas={popular.data} />
      )}
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
      renderItem={({ item }) => <GachaResultCard gacha={item} />}
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
      ListEmptyComponent={
        search.isPending ? (
          <StateMessage loading message={t("common.loading")} />
        ) : search.isError ? (
          <StateMessage message={t("common.loadFailed")} />
        ) : (
          <NoResult keyword={keyword} />
        )
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

/** 결과 없음. 일러스트 대신 연한 포인트 원 안에 검색 아이콘. */
function NoResult({ keyword }: { keyword: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: space[18],
        paddingHorizontal: space[16],
        paddingBottom: NO_RESULT_LIFT,
      }}
    >
      <View
        style={{
          width: NO_RESULT_ICON_SIZE,
          height: NO_RESULT_ICON_SIZE,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentSoft,
        }}
      >
        <Ionicons name="search" size={40} color={colors.accent} />
      </View>
      <View style={{ gap: space[6] }}>
        <Text variant="titleLg" style={{ textAlign: "center" }}>
          {t("search.noResult", { keyword })}
        </Text>
        <Text variant="label" weight="regular" color="textMuted" style={{ textAlign: "center" }}>
          {t("search.noResultHint")}
        </Text>
      </View>
    </View>
  );
}
