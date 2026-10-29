import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { StateMessage } from "@/components/StateMessage";

/**
 * 공지 목록. 홈 공지 띠를 누르면 여기로 온다. 지금은 "준비 중" 문구만 있다.
 * TODO(여경): useNotices 로 목록(고정 공지 먼저 · 최신순)과 공지 상세 · 공지가 없을 때 화면을 만든다.
 */
export default function NoticeListScreen() {
  const { t } = useTranslation();
  return (
    <>
      {/* minimal: iOS 뒤로 버튼에 앞 화면 이름 "(tabs)" 가 붙지 않게 화살표만 보인다 */}
      <Stack.Screen
        options={{ title: t("notice.title"), headerBackButtonDisplayMode: "minimal" }}
      />
      <StateMessage fill message={t("notice.comingSoon")} />
    </>
  );
}
