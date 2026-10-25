import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { StateMessage } from "@/components/StateMessage";

/**
 * 공지 목록. 홈 공지 띠의 "전체보기"가 여기로 온다. 지금은 라우트 자리만 있다.
 * TODO(여경): 목록(고정 공지 먼저 · 최신순, useNotices) · 상세 · 빈 상태(시안 "B · 공지사항 · 빈 상태")
 */
export default function NoticeListScreen() {
  const { t } = useTranslation();
  return (
    <>
      {/* iOS 는 뒤로 버튼 옆에 앞 화면 이름을 붙이는데, 탭 그룹은 제목이 없어 "(tabs)" 가 보인다. 화살표만 둔다 */}
      <Stack.Screen
        options={{ title: t("notice.title"), headerBackButtonDisplayMode: "minimal" }}
      />
      <StateMessage fill message={t("notice.comingSoon")} />
    </>
  );
}
