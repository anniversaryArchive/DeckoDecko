import { router } from "expo-router";

/** 가챠 상세로 이동. 카드 자리(GachaCardSlot)가 쓴다. */
export function openGacha(id: string) {
  router.push({ pathname: "/gacha/[id]", params: { id } });
}

/** 요청 · 문의 보내기로 이동. gachaName 을 넘기면 가챠 이름 칸을 채워 둔다 (검색 결과 없음). */
export function openFeedback(gachaName?: string) {
  router.push({ pathname: "/feedback", params: gachaName ? { gachaName } : {} });
}

/** 뒤로 가기. 링크로 바로 열려 돌아갈 화면이 없으면 홈으로 간다. */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
