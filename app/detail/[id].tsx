import React from "react";
import { View, ScrollView, Image, Pressable } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/utils/supabase";
import { getDeviceUuid } from "@/utils/deviceUuid";

import { WiggleBorder, WiggleDivider, Chip, Typography, Icon } from "@/components";

import type { TGacha } from "@/types/gacha";

const MOCKUP_LIST = [{ id: 1, name: "히나타", type: "wish" }] as const;
interface IGachaItem {
  id: number;
  name: string;
  type: "wish" | "get";
  image_link?: string;
}

export default function DetailPagef() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [gachaData, setGachaData] = React.useState<TGacha | null>(null);
  const [list, setList] = React.useState<IGachaItem[]>([]);

  React.useEffect(() => {
    const fetchGachaData = async () => {
      try {
        // id로 가챠 데이터 조회, media_id가 있으면 media 테이블을 join해서 가져오기
        const { data, error } = await supabase
          .from("gacha")
          .select(
            `
            *,
            media:media_id (
              id,
              kr_title
            )
          `
          )
          .eq("id", id)
          .single();

        if (error || !data) throw error;
        setGachaData(data);
        // TODO: 가챠 내 아이템 목록은 임시로 mockup 데이터, 추후에 치환
        setList([...MOCKUP_LIST]);
      } catch (err) {
        console.error("🚨 Catch block error:", err);
        navigation.goBack();
      }
    };

    // 가챠 상세 조회 로그 기록
    const logGachaView = async () => {
      try {
        const deviceUuid = await getDeviceUuid();
        if (!deviceUuid) return;
        await supabase.from("gacha_view_log").insert({ uuid: deviceUuid, gacha_id: id });
      } catch (logError) {
        console.error("🚨 가챠 조회 로그 기록 실패:", logError);
      }
    };

    fetchGachaData();
    logGachaView();
  }, [navigation, id]);

  const handleAddGacha = () => {
    // TODO:
    console.log("🚀 추가 Bottom Sheet 열기");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between h-12 px-6">
        <Pressable onPress={handleBack}>
          <Icon name="back" size={24} fill="secondary.dark" stroke="secondary.dark" />
        </Pressable>
      </View>

      <View className="px-6">
        {/* 가챠 이미지 */}
        <WiggleBorder height={350} backgroundColor="#fff" borderZIndex={2}>
          <View className="w-full h-full p-2">
            <Image source={{ uri: gachaData?.image_link }} className="w-full h-full" />
          </View>
        </WiggleBorder>
        {/* 가챠 에니메이션 제목 (없는 경우, 기타) */}
        <View className="flex items-start py-2">
          <Chip label={gachaData?.meida?.kr_title || "기타"} />
        </View>
        {/* 가챠 이름 */}
        <Typography variant="header2" twotone="primary">
          {gachaData?.name_kr}
        </Typography>
        <View className="py-2">
          <WiggleDivider strokeWidth={2} strokeColor="secondary.dark" />
        </View>
      </View>

      <ScrollView className="px-6 pt-2 pb-10">
        {/* 가챠의 내 아이템 목록 (Wish, Get) */}
        {list.map((item) => (
          <WiggleBorder key={`gacha-item-${item.id}`} strokeColor="secondary.dark">
            <View className="flex flex-row gap-2 p-2">
              <View className="w-11 h-11 rounded">
                <Image
                  source={{ uri: item.image_link || gachaData?.image_link }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1 my-auto">
                <Typography variant="header5" color="secondary-dark">
                  {item.name}
                </Typography>
              </View>

              <View
                className={`rounded my-auto bg-${item.type === "wish" ? "primary" : "secondary"} flex items-center justify-center w-14 h-7`}
              >
                <Typography variant="tag" color="secondary-light">
                  {item.type.toUpperCase()}
                </Typography>
              </View>
            </View>
          </WiggleBorder>
        ))}
      </ScrollView>

      {/* Add Gacha Floating Button */}
      <Pressable
        className="bg-primary right-6 absolute p-2 rounded-full"
        style={{ bottom: 8 + insets.bottom }}
        onPress={handleAddGacha}
      >
        <Icon name="plus2" size={36} fill="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
