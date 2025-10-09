import { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";

import { supabase } from "@/utils/supabase";
import { Icon, NoticeItem } from "@/components";
import { getColor } from "@/utils/color";

import type { TNotice } from "@/types/notice";

export default function Notice() {
  const [noticeList, setNoticeList] = useState<TNotice[]>([]);

  useEffect(() => {
    // 공지사항 데이터 2개 조회
    const fetchNoticeList = async () => {
      try {
        const { data } = await supabase
          .from("notice")
          .select("*")
          .order("is_fixed", { ascending: false })
          .order("created_at", { ascending: false });
        setNoticeList(data || []);
      } catch (error) {
        console.error("❌ 공지사항 데이터 조회 실패:", error);
      }
    };
    fetchNoticeList();
  }, []);

  const goToNoticeDetail = (id: number) => {
    router.push(`/notice/${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "공지사항",
          headerShown: true,
          headerTitleStyle: { fontFamily: "DunggeunmisoB", color: getColor("secondary-dark") },
          contentStyle: { backgroundColor: "white" },
          headerLeft: () => (
            <TouchableOpacity className="ml-1.5" onPress={() => router.back()}>
              <Icon
                name="back"
                size={24}
                fill={getColor("secondary-dark")}
                stroke={getColor("secondary-dark")}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView>
        <View className="flex flex-col gap-3 p-4">
          {noticeList.map((notice) => (
            <NoticeItem key={`notice-${notice.id}`} notice={notice} onClick={goToNoticeDetail} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}
