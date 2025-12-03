import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/utils/supabase";
import type { TNotice } from "@/types/notice";

// eslint-disable-next-line import/no-unresolved
import slide1 from "@/assets/main_slide.png";

import {
  BasicSwiper,
  Button,
  FeaturedSwiper,
  Header,
  NoticeItem,
  ProgressBar,
  Spinner,
  Typography,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const fetchNewGachaData = supabase
          .from("gacha")
          .select("id, imageLink:image_link, mediaId:media_id")
          .order("created_at", { ascending: false })
          .limit(LIMIT_COUNT);

        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const fetchPopularGachaData = supabase
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

        const fetchNoticeData = supabase
          .from("notice")
          .select("*")
          .order("is_fixed", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(2);

        const [newGachaRes, popularGachaRes, noticeRes] = await Promise.all([
          fetchNewGachaData,
          fetchPopularGachaData,
          fetchNoticeData,
        ]);

        if (newGachaRes.data?.length) {
          setNewGachaList(newGachaRes.data as unknown as IPreviewGacha[]);
        }

        if (popularGachaRes.data?.length) {
          const gachaData = popularGachaRes.data.reduce(
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
        }

        setNoticeList(noticeRes.data || []);

        try {
          const myItems = await items.getAll();
          const getCount = myItems.filter(({ type }) => type === "GET").length;
          const allCount = myItems.length;
          setPossessionRate(getCount === 0 ? 0 : Math.floor((getCount / allCount) * 100));
        } catch (error) {
          console.error("❌ Wish/Get 아이템 조회 실패 : ", error);
        }
      } catch (error) {
        console.error("❌ 데이터를 불러오는 중 에러 발생 : ", error);
      }
      setLoading(false);
    };

    loadAllData();
  }, []);

  const handleNavigateToDetail = (id: number) => {
    router.push(`/detail/${id}`);
  };

  const goToNotice = () => {
    router.push("/notice");
  };

  const goToNoticeDetail = (id: number) => {
    router.push(`/notice/${id}`);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 gap-1.5 pt-1">
      <Spinner visible={loading} />
      <Header horizontalGap />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-14"
        showsVerticalScrollIndicator={false}
      >
        {/* 배너 영역 */}
        <BasicSwiper data={[{ image: slide1 }]} />

        {/* 내 굿즈 소장률 */}
        <View className="px-6">
          <Typography variant="header2" color="primary">
            내 굿즈 소장률
          </Typography>
          <View className="mt-4">
            <ProgressBar value={possessionRate} height={18} />
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
        <View className="bg-primary-light py-7 px-6">
          <View className="flex flex-row justify-between mb-4">
            <Typography variant="header2" color="secondary-dark">
              공지사항
            </Typography>

            <Button variant="text" size="sm" onPress={goToNotice}>
              <Typography variant="tag" color="gray-04">
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
    </SafeAreaView>
  );
}
