import { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/utils/supabase";

import {
  Button,
  Typography,
  FeaturedSwiper,
  WiggleBorder,
  BasicSwiper,
  Icon,
  ProgressBar,
} from "@/components";
import { formatYmdHm } from "@/utils/format";

const LIMIT_COUNT = 5;

interface PreviewGacha {
  id: number;
  image_link: string;
  anime_id: number;
}

interface Notice {
  id: number;
  title: string;
  created_at: string;
}

export default function Home() {
  const [newGachaList, setNewGachaList] = useState<PreviewGacha[]>([]);
  const [popularGachaList, setPopularGachaList] = useState<PreviewGacha[]>([]);
  const [noticeList, setNoticeList] = useState<Notice[]>([]);
  const [possessionRate, setPossessionRate] = useState<number>(0);

  useEffect(() => {
    // 최근에 새로 추가된 가챠 5개 조회
    const fetchNewGachaData = async () => {
      try {
        const { data } = await supabase
          .from("gacha")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(LIMIT_COUNT);
        if (!data?.length) throw new Error("No data");
        setNewGachaList(data);
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
              image_link,
              anime_id
            )
          `
          )
          .gte("created_at", tenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        if (!data?.length) return;

        const gachaData = data.reduce(
          (acc: Record<number, { count: number; gacha: PreviewGacha }>, item: any) => {
            const { gacha_id, gacha } = item;
            if (!acc[gacha_id]) acc[gacha_id] = { count: 0, gacha: gacha as PreviewGacha };
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
        console.log("🚀 공지사항 데이터:", data);
        setNoticeList(data || []);
      } catch (error) {
        console.error("❌ 공지사항 데이터 조회 실패:", error);
      }
    };

    fetchNewGachaData();
    fetchPopularGachaData();
    fetchNoticeData();
  }, []);

  const handleNavigateToDetail = (id: number) => {
    router.push(`/detail/${id}`);
  };

  const goToSearch = () => {
    router.push("/(tabs)/Search");
  };

  return (
    <View className="flex-1">
      <View className="w-full bg-white flex justify-between flex-row py-2 px-4">
        <Typography variant="Header1" color="primary">
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
        <View className="px-4 py-14">
          <Typography variant="Header2" color="primary">
            내 굿즈 소장률
          </Typography>

          <View className="mt-4">
            <ProgressBar value={possessionRate} />
          </View>
        </View>

        {/* 새로 나온 가챠! */}
        <FeaturedSwiper
          title="새로 나왔어요!"
          data={newGachaList.map((gacha) => ({ ...gacha, imageUrl: gacha.image_link }))}
          width={225}
          offset={20}
          loop={true}
          onSlidePress={(item) => handleNavigateToDetail(item.id)}
        />

        <View className="mt-10" />

        {/* 인기 가챠 */}
        <FeaturedSwiper
          title="지금 이게 인기에요!"
          data={popularGachaList.map((gacha) => ({ ...gacha, imageUrl: gacha.image_link }))}
          width={225}
          offset={20}
          loop={true}
          onSlidePress={(item) => handleNavigateToDetail(item.id)}
        />

        {/* 공지사항 */}
        <View className="bg-primary-light py-7 px-4 mt-16">
          <View className="flex justify-between flex-row mb-2">
            <Typography variant="Header2" color="secondary-dark">
              공지사항
            </Typography>

            <Button variant="text" size="sm">
              <Typography variant="Tag" className="text-gray-04">
                전체보기 &gt;
              </Typography>
            </Button>
          </View>

          <View className="flex flex-col gap-3">
            {noticeList.map((notice) => (
              <WiggleBorder
                key={`notice-${notice.id}`}
                backgroundColor="#FFF"
                borderZIndex={2}
                height={60}
              >
                <View className="p-3 mr-auto">
                  <View className="mb-1">
                    <Typography variant="Header5" color="primary">
                      {notice.title}
                    </Typography>
                  </View>
                  <Typography variant="Caption" className="text-gray-04">
                    {formatYmdHm(notice.created_at)}
                  </Typography>
                </View>
              </WiggleBorder>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
