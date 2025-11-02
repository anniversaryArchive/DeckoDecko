import { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/utils/supabase";
import type { TNotice } from "@/types/notice";

import {
  Button,
  Typography,
  FeaturedSwiper,
  BasicSwiper,
  Icon,
  ProgressBar,
  NoticeItem,
} from "@/components";
import items from "@table/items";

const LIMIT_COUNT = 5;

interface IPreviewGacha {
  id: number;
  imageLink: string;
  mediaId: number;
}

export default function Home() {
  const [newGachaList, setNewGachaList] = useState<IPreviewGacha[]>([]);
  const [popularGachaList, setPopularGachaList] = useState<IPreviewGacha[]>([]);
  const [noticeList, setNoticeList] = useState<TNotice[]>([]);
  const [possessionRate, setPossessionRate] = useState<number>(0);

  useEffect(() => {
    // 최근에 새로 추가된 가챠 5개 조회
    const fetchNewGachaData = async () => {
      try {
        const { data } = await supabase
          .from("gacha")
          .select("id, imageLink:image_link, mediaId:media_id")
          .order("created_at", { ascending: false })
          .limit(LIMIT_COUNT);
        if (!data?.length) throw new Error("No data");
        setNewGachaList(data as unknown as IPreviewGacha[]);
      } catch (error) {
        console.error("❌ 새로 나왔어요! 가챠 데이터 조회 실패 : ", error);
      }
    };

    // 최근 10일 동안 많이 본 가챠 상위 5개 조회
    const fetchPopularGachaData = async () => {
      try {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const { data } = await supabase
          .from("gacha_view_log")
          .select(
            `
            gacha_id,
            gacha!inner (
              id,
              imageLink:image_link,
              mediaId:media_id
            )
          `
          )
          .gte("created_at", tenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        if (!data?.length) return;

        const gachaData = data.reduce(
          (acc: Record<number, { count: number; gacha: IPreviewGacha }>, item: any) => {
            const { gacha_id, gacha } = item;
            if (!acc[gacha_id]) acc[gacha_id] = { count: 0, gacha: gacha as IPreviewGacha };
            acc[gacha_id].count += 1;
            return acc;
          },
          {}
        );
        const list = Object.values(gachaData)
          .sort((a, b) => b.count - a.count)
          .map((item) => item.gacha)
          .slice(0, LIMIT_COUNT);
        setPopularGachaList(list);
      } catch (error) {
        console.error("❌ 인기 가챠 데이터 조회 실패:", error);
      }
    };

    // 공지사항 데이터 2개 조회
    const fetchNoticeData = async () => {
      try {
        const { data } = await supabase
          .from("notice")
          .select("*")
          .order("is_fixed", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(2);
        setNoticeList(data || []);
      } catch (error) {
        console.error("❌ 공지사항 데이터 조회 실패:", error);
      }
    };

    // Wish/Get 아이템 조회 - 소장률 계산
    const getAllMyItems = async () => {
      try {
        const myItems = await items.getAll();
        const getCount = myItems.filter(({ type }) => type === "GET").length;
        const allCount = myItems.length;
        setPossessionRate(Math.floor((getCount / allCount) * 100));
      } catch (error) {
        console.error("❌ Wish/Get 아이템 조회 실패 : ", error);
      }
    };

    fetchNewGachaData();
    fetchPopularGachaData();
    fetchNoticeData();
    getAllMyItems();
  }, []);

  const handleNavigateToDetail = (id: number) => {
    router.push(`/detail/${id}`);
  };

  const goToSearch = () => {
    router.push("/(tabs)/search");
  };

  const goToNotice = () => {
    router.push("/notice");
  };

  const goToNoticeDetail = (id: number) => {
    router.push(`/notice/${id}`);
  };

  return (
    <View className="flex-1">
      <View className="flex flex-row justify-between w-full px-4 py-2 bg-white">
        <Typography variant="header1" color="primary">
          LOGO
        </Typography>
        <View className="my-auto">
          <Pressable onPress={goToSearch}>
            <Icon name="bigHeadSearch" size={24} />
          </Pressable>
        </View>
      </View>
      <ScrollView className="flex-1">
        {/* 배너 영역 */}
        <BasicSwiper data={[1, 2, 3]} />

        {/* 내 굿즈 소장률 */}
        <View className="py-14 px-4">
          <Typography variant="header2" color="primary">
            내 굿즈 소장률
          </Typography>

          <View className="mt-4">
            <ProgressBar value={possessionRate} />
          </View>
        </View>

        {/* 새로 나온 가챠! */}
        <FeaturedSwiper
          title="새로 나왔어요!"
          data={newGachaList.map((gacha) => ({ ...gacha, imageUrl: gacha.imageLink }))}
          width={225}
          offset={20}
          loop={true}
          onSlidePress={(item) => handleNavigateToDetail(item.id)}
        />

        <View className="mt-10" />

        {/* 인기 가챠 */}
        <FeaturedSwiper
          title="지금 이게 인기에요!"
          data={popularGachaList.map((gacha) => ({ ...gacha, imageUrl: gacha.imageLink }))}
          width={225}
          offset={20}
          loop={true}
          onSlidePress={(item) => handleNavigateToDetail(item.id)}
        />

        {/* 공지사항 */}
        <View className="bg-primary-light py-7 px-4 mt-16">
          <View className="flex flex-row justify-between mb-4">
            <Typography variant="header2" color="secondary-dark">
              공지사항
            </Typography>

            <Button variant="text" size="sm" onPress={goToNotice}>
              <Typography variant="tag" className="text-gray-04">
                전체보기 &gt;
              </Typography>
            </Button>
          </View>

          <View className="flex flex-col gap-3">
            {noticeList.map((notice) => (
              <NoticeItem key={`notice-${notice.id}`} notice={notice} onClick={goToNoticeDetail} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
