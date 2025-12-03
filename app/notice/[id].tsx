import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Typography, Icon, Spinner } from "@/components";
import { supabase } from "@/utils/supabase";
import { formatYmdHm } from "@/utils/format";
import { colors } from "@utils/tailwind-colors";

import type { TNotice } from "@/types/notice";

export default function NoticeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice] = useState<TNotice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setIsLoading(true);
        const response = await supabase.from("notice").select("*").eq("id", id).single();
        if (response.error || !response.data) throw response.error;
        setNotice(response.data);
      } catch (error) {
        console.error("❌ 공지사항 데이터 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  return (
    <>
      <Spinner visible={isLoading} />
      <Stack.Screen
        options={{
          title: isLoading ? "" : notice?.title,
          headerShown: true,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: "DunggeunmisoB" },
          headerTintColor: colors.primary.DEFAULT,
          headerBackButtonDisplayMode: "minimal",
          headerLeft: ({ tintColor }) => (
            <TouchableOpacity className="mx-1.5" onPress={() => router.back()}>
              <Icon name="chevronLeft" size={24} fill={tintColor} stroke={tintColor} />
            </TouchableOpacity>
          ),
        }}
      />
      {notice && (
        <ScrollView
          className="p-6"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={true}
        >
          <Typography variant="body4" className="text-right">
            {formatYmdHm(notice.created_at)}
          </Typography>
          <Typography variant="body1" color="black" className="mt-6" numberOfLines={0}>
            {notice.content}
          </Typography>
        </ScrollView>
      )}
      {!isLoading && !notice && (
        <View className="p-6 mx-auto">
          <Typography variant="title1" color="black">
            "해당 공지사항을 찾을 수 없습니다!"
          </Typography>
        </View>
      )}
    </>
  );
}
