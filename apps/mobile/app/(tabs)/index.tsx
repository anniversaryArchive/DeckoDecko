import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useGachaList } from "@deckodecko/core/react";
import { space } from "@deckodecko/ui";
import { Text } from "@deckodecko/ui/native";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { formatItemCount } from "@/lib/i18n";

/** 홈. 소장률 카드 · 신상 · 인기 · 공지 띠는 목 데이터로 채운다. 지금은 저장소 훅이 도는지 보여 주는 목록만 있다. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { data: gachaList, isPending, isError } = useGachaList();
  const sample = gachaList?.[0];
  return (
    <PlaceholderScreen title={t("home.title")} description={t("home.description")}>
      {/* 글꼴 확인용: 한글은 Noto Sans KR, 숫자 · 영어 · 특수문자는 Inter. 실제 소장률 카드가 생기면 지운다. */}
      <View style={{ marginTop: space[16], gap: space[4] }}>
        <Text variant="label" color="textMuted">
          {t("home.collectionRate")}
        </Text>
        <Text variant="displayLg" color="accent">
          64%
        </Text>
        {/* 한글과 영어 · 숫자가 섞인 가챠 이름 (목 데이터 첫 번째) */}
        {sample ? (
          <Text variant="headingLg" color="textMuted">
            {sample.nameKo ?? sample.name}
          </Text>
        ) : null}
      </View>
      {isPending && <Text color="textMuted">{t("common.loading")}</Text>}
      {isError && <Text color="accent">{t("home.listFailed")}</Text>}
      {gachaList?.map((gacha) => (
        <Link key={gacha.id} href={{ pathname: "/gacha/[id]", params: { id: gacha.id } }} asChild>
          <Text>
            {gacha.nameKo ?? gacha.name}
            <Text color="textMuted">
              {"  "}
              {gacha.media?.title ?? ""} · {formatItemCount(gacha.itemCount ?? 0)}
            </Text>
          </Text>
        </Link>
      ))}
      <Link href="/gacha/sample" asChild>
        <Text variant="bodyStrong" color="accent" style={{ marginTop: space[16] }}>
          {t("home.missingGachaLink")}
        </Text>
      </Link>
    </PlaceholderScreen>
  );
}
