import { router } from "expo-router";

/** 가챠 상세로 이동. 카드 자리(GachaCardSlot)가 쓴다. */
export function openGacha(id: string) {
  router.push({ pathname: "/gacha/[id]", params: { id } });
}
