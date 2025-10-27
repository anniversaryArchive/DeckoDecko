import { Pressable, View } from "react-native";

import WiggleBorder from "@components/WiggleBorder";
import Typography from "@components/Typography";
import { formatYmdHm } from "@/utils/format";

import type { TNotice } from "@/types/notice";

interface INoticeItem {
  notice: TNotice;
  onClick: (id: number) => void;
}

export default function NoticeItem(props: INoticeItem) {
  const { notice, onClick } = props;

  return (
    <Pressable key={`notice-${notice.id}`} onPress={() => onClick(notice.id)}>
      <WiggleBorder backgroundColor="#FFF" borderZIndex={2} height={60}>
        <View className="p-3 mr-auto">
          <View className="mb-1">
            <Typography variant="header5" color="primary">
              {notice.title}
            </Typography>
          </View>
          <Typography variant="caption1" className="text-gray-04">
            {formatYmdHm(notice.created_at)}
          </Typography>
        </View>
      </WiggleBorder>
    </Pressable>
  );
}
