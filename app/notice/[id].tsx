import { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";

import { Typography, Icon } from "@/components";
import type { TNotice } from "@/types/notice";
import { supabase } from "@/utils/supabase";
import { formatYmdHm } from "@/utils/format";
import { getColor } from "@/utils/color";

export default function NoticeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice] = useState<TNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
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
      <Stack.Screen
        options={{
          title: notice?.title || "공지사항",
          headerShown: true,
          headerTitleStyle: { fontFamily: "DunggeunmisoB", color: getColor("primary") },
          contentStyle: { backgroundColor: "white" },
          headerLeft: () => (
            <TouchableOpacity className="ml-1.5" onPress={() => router.back()}>
              <Icon name="back" size={24} fill={getColor("primary")} stroke={getColor("primary")} />
            </TouchableOpacity>
          ),
        }}
      />
      {notice ? (
        <ScrollView
          className="p-6"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={true}
        >
          <Typography variant="Body3" className="text-right">
            {formatYmdHm(notice.created_at)}
          </Typography>
          <Typography variant="Body1" color="black" className="mt-6" numberOfLines={0}>
            {notice.content}
          </Typography>
        </ScrollView>
      ) : (
        <View className="p-6">
          <Typography variant="Body1" color="black" className="mt-6" numberOfLines={0}>
            {isLoading ? "Loading..." : "해당 공지사항을 찾을 수 없습니다!"}
          </Typography>
        </View>
      )}
    </>
  );
}
