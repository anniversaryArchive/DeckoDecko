import { router } from "expo-router";

/** 가챠 상세로 이동. 카드 자리(GachaCardSlot)가 쓴다. */
export function openGacha(id: string) {
  router.push({ pathname: "/gacha/[id]", params: { id } });
}

/** 뒤로 가기. 링크로 바로 열려 돌아갈 화면이 없으면 홈으로 간다. */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
