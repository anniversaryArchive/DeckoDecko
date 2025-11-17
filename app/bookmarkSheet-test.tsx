import { View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookmarkSheet, Button } from "@components/index";
import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { supabase } from "@utils/supabase";
import items from "@table/items";

export default function BottomTest() {
  const [gachaList, setGachaList] = useState<any>([]);
  const [gachaId, setGachaId] = useState();
  const openSheet = activeBottomSheet((state) => state.openSheet);

  useEffect(() => {
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
          .limit(10);

        if (error || !data) throw error;
        setGachaList(data);
      } catch (err) {
        console.error("🚨 Catch block error:", err);
      }
    };

    fetchGachaData();
  }, []);

  return (
    <>
      <SafeAreaView className="items-center justify-center flex-1 gap-8 px-6">
        <Button
          size="xl"
          width="full"
          bold
          rounded
          onPress={async () => {
            await items.clear();
          }}
        >
          북마크 초기화
        </Button>
        <Button
          size="xl"
          width="full"
          color="secondary"
          bold
          rounded
          onPress={async () => {
            await items.migration();
          }}
        >
          북마크 테이블 마이그레이션
        </Button>
        <View className="flex gap-4">
          {gachaList.map((gacha: any) => {
            return (
              <Button
                key={gacha.id}
                size="md"
                color="secondary-dark"
                bold
                onPress={() => {
                  setGachaId(gacha.id);
                  openSheet("BOOKMARK");
                }}
              >
                {gacha.name_kr}
              </Button>
            );
          })}
        </View>
      </SafeAreaView>
      {gachaId && <BookmarkSheet gachaId={gachaId} />}
    </>
  );
}
