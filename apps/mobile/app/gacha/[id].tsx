import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { useGacha } from "@deckodecko/core/react";
import { Text } from "@deckodecko/ui/native";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { formatMonth, formatPrice } from "@/lib/i18n";

/** 가챠 상세. 탭 밖의 스택 화면이라 뒤로가기 헤더가 붙는다. 레이아웃은 #107 에서 채운다. */
export default function GachaDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: gacha, isLoading, isError, refetch } = useGacha(id);

  if (isLoading) {
    return <PlaceholderScreen title={t("detail.title")} description={t("common.loading")} />;
  }
  // 실패를 "없음"과 구분한다. 확인하지 않으면 네트워크 · RLS 에러도 없는 가챠로 보인다.
  if (isError) {
    return (
      <PlaceholderScreen title={t("detail.title")} description={t("common.loadFailed")}>
        <Text variant="body" weight="bold" color="accent" onPress={() => refetch()}>
          {t("common.retry")}
        </Text>
      </PlaceholderScreen>
    );
  }
  if (!gacha) {
    return (
      <PlaceholderScreen title={t("detail.title")} description={t("detail.notFound", { id })} />
    );
  }
  return (
    <PlaceholderScreen
      title={gacha.nameKo ?? gacha.name}
      description={[
        gacha.name,
        gacha.media?.title,
        gacha.releaseMonth ? formatMonth(gacha.releaseMonth) : null,
        gacha.price != null ? formatPrice(gacha.price) : null,
      ]
        .filter(Boolean)
        .join(" · ")}
    >
      {gacha.items.map((item) => (
        <Text key={item.id}>
          {item.number}. {item.nameKo ?? item.name}
        </Text>
      ))}
    </PlaceholderScreen>
  );
}
