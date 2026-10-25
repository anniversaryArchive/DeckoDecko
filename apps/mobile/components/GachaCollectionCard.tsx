import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { GachaCollection } from "@deckodecko/core";
import { space } from "@deckodecko/ui";
import { Card, ProgressBar, Text } from "@deckodecko/ui/native";

/** 가챠 상세의 "이 가챠 소장률" 카드. 라인업 한 종을 한 칸으로 GET · WISH · 미등록 순서로 칠한다. */
export function GachaCollectionCard({ collection }: { collection: GachaCollection }) {
  const { t } = useTranslation();
  const { total, get, wish, missing, rate } = collection;

  return (
    <Card style={{ paddingVertical: space[16], paddingHorizontal: space[18], gap: space[10] }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Text variant="label" weight="bold" color="textMuted">
          {t("detail.collectionTitle")}
        </Text>
        {total > 0 && (
          <Text variant="headingSm" color="accent">
            {t("detail.collectionOwned", { count: get })}
            <Text variant="label" weight="regular" color="textMuted">
              {t("detail.collectionRest", { total, rate })}
            </Text>
          </Text>
        )}
      </View>

      {total === 0 ? (
        <Text variant="caption" color="textMuted">
          {t("detail.noLineup")}
        </Text>
      ) : (
        <ProgressBar
          variant="segments"
          get={get}
          wish={wish}
          total={total}
          accessibilityLabel={t("detail.collectionLabel", { count: get, total, rate })}
          legend={{
            get: t("detail.collectionGet", { count: get }),
            wish: t("detail.collectionWish", { count: wish }),
            none: t("detail.collectionMissing", { count: missing }),
          }}
        />
      )}
    </Card>
  );
}
