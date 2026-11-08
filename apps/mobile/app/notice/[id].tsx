import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotice } from "@deckodecko/core/react";
import { border, gutter, space, useTheme } from "@deckodecko/ui";
import { Button, Card, Text } from "@deckodecko/ui/native";

import { EmptyState } from "@/components/EmptyState";
import { NoticeMeta } from "@/components/NoticeMeta";
import { QueryState } from "@/components/QueryState";
import { ScreenHeader } from "@/components/ScreenHeader";

/**
 * 공지 상세 (시안 B_NoticeDetail). 공지 목록에서 공지를 누르면 온다.
 * 내용은 운영자가 쓴 글을 그대로(줄바꿈 포함) 보인다. 시안의 강조 상자 같은 서식은 없다.
 */
export default function NoticeDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notice = useNotice(id);

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={t("notice.title")} />
      <QueryState query={notice} fill empty={<NoticeNotFound />}>
        {(data) => (
          <ScrollView
            contentContainerStyle={{
              paddingTop: space[10],
              paddingHorizontal: gutter,
              paddingBottom: insets.bottom + space[24],
            }}
          >
            <Card
              style={{
                gap: space[16],
                paddingTop: space[20],
                paddingHorizontal: space[20],
                paddingBottom: space[24],
              }}
            >
              <View style={{ gap: space[8] }}>
                <NoticeMeta notice={data} />
                <Text variant="headingSm" accessibilityRole="header">
                  {data.title}
                </Text>
              </View>
              <View style={{ height: border.divider, backgroundColor: colors.lineSoft }} />
              <Text variant="bodyLoose" selectable>
                {data.content}
              </Text>
            </Card>
          </ScrollView>
        )}
      </QueryState>
    </View>
  );
}

/** 없는 공지 (목록을 받은 뒤 운영자가 지웠거나, 링크로 잘못 들어온 경우) */
function NoticeNotFound() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="document-text-outline"
      title={t("notice.notFoundTitle")}
      description={t("notice.notFoundDescription")}
      action={
        // 목록이 스택에 있으면 거기까지 닫고, 없으면 목록으로 바꾼다
        <Button size="md" variant="secondary" onPress={() => router.dismissTo("/notice")}>
          {t("notice.backToList")}
        </Button>
      }
    />
  );
}
