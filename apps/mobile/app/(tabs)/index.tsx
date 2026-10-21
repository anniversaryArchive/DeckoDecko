import { Link, router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGachaList, usePopularGacha } from "@deckodecko/core/react";
import { gutter, space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { GachaCardSlot } from "@/components/GachaCardSlot";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { QueryState } from "@/components/QueryState";
import { SectionHeader } from "@/components/SectionHeader";
import { StateMessage } from "@/components/StateMessage";

/** 홈. 상단 바 · 새로 나왔어요(세로 카드 가로 스크롤) · 지금 인기(가로 카드 목록). 공지 띠 · 소장률 카드는 2주차 이후. */
export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <HomeHeader />
      <ScrollView
        contentContainerStyle={{ paddingTop: space[6], paddingBottom: space[24], gap: space[24] }}
      >
        <NewArrivalsSection />
        <PopularSection />
        {/* 개발 빌드에서만 보인다. 출시 빌드에서는 카탈로그 화면도 홈으로 돌려보낸다. 개발자만 보는 문구라 i18n 을 거치지 않는다. */}
        {__DEV__ ? (
          <Link href="/dev/components" asChild>
            <Text variant="bodyStrong" color="accent" style={{ paddingHorizontal: gutter }}>
              컴포넌트 카탈로그 (개발용)
            </Text>
          </Link>
        ) : null}
      </ScrollView>
    </View>
  );
}

function HomeHeader() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: insets.top + space[24],
        paddingHorizontal: gutter,
        paddingBottom: space[10],
      }}
    >
      <Text variant="headingSm" accessibilityRole="header">
        {t("common.appName")}
      </Text>
      <HeaderIconButton
        icon="search"
        variant="outline"
        label={t("search.title")}
        onPress={() => router.push("/search")}
      />
    </View>
  );
}

/** "새로 나왔어요": 가로로 넘기는 카드. */
function NewArrivalsSection() {
  const { t } = useTranslation();
  const latest = useGachaList();
  return (
    <Section header={<SectionHeader title={t("home.newArrivals")} badge={t("home.newBadge")} />}>
      <QueryState
        query={latest}
        isEmpty={(list) => list.length === 0}
        empty={<StateMessage message={t("home.empty")} />}
      >
        {(list) => (
          <FlatList
            horizontal
            data={list}
            keyExtractor={(gacha) => gacha.id}
            renderItem={({ item }) => <GachaCardSlot gacha={item} layout="vertical" />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: gutter, gap: space[12] }}
          />
        )}
      </QueryState>
    </Section>
  );
}

/** "지금 인기": 최근 10일 인기 순. */
function PopularSection() {
  const { t } = useTranslation();
  const popular = usePopularGacha();
  return (
    <Section header={<SectionHeader title={t("home.popular")} caption={t("common.last10Days")} />}>
      <View style={{ paddingHorizontal: gutter }}>
        <QueryState
          query={popular}
          isEmpty={(list) => list.length === 0}
          empty={<StateMessage message={t("home.empty")} />}
        >
          {(list) => (
            <View style={{ gap: space[10] }}>
              {list.map((gacha) => (
                <GachaCardSlot key={gacha.id} gacha={gacha} layout="horizontal" />
              ))}
            </View>
          )}
        </QueryState>
      </View>
    </Section>
  );
}

/** 섹션 = 제목(좌우 gutter) + 14 아래 내용. 내용의 좌우 여백은 내용 쪽에서 준다 (가로 스크롤은 끝까지 닿아야 해서). */
function Section({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: space[14] }}>
      <View style={{ paddingHorizontal: gutter }}>{header}</View>
      {children}
    </View>
  );
}
