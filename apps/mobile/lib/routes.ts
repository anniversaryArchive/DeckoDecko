import { router } from "expo-router";

// push 가 아니라 navigate 를 쓴다. 맨 위 화면과 경로 · 파라미터가 같으면 새로 쌓지 않아, Android 에서 카드를 연타해도 상세가 하나만 열린다 (expo-router 57).

/** 가챠 상세로 이동. 카드 자리(GachaCardSlot)가 쓴다. */
export function openGacha(id: string) {
  router.navigate({ pathname: "/gacha/[id]", params: { id } });
}

/** 공지 상세로 이동 (공지 목록) */
export function openNotice(id: string) {
  router.navigate({ pathname: "/notice/[id]", params: { id } });
}

/** 요청 · 문의 보내기로 이동. gachaName 을 넘기면 가챠 이름 칸을 채워 둔다 (검색 결과 없음). */
export function openFeedback(gachaName?: string) {
  router.navigate({ pathname: "/feedback", params: gachaName ? { gachaName } : {} });
}

/** 뒤로 가기. 링크로 바로 열려 돌아갈 화면이 없으면 홈으로 간다. */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
