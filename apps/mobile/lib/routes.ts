import { router } from "expo-router";

/** 가챠 상세로 이동. 카드 · 순위 줄 · 결과 카드가 같이 쓴다. */
export function openGacha(id: string) {
  router.push({ pathname: "/gacha/[id]", params: { id } });
}
