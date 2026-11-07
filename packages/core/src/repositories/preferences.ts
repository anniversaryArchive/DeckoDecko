import type { GoodsViewMode } from "../types";

/** 저장된 값이 없거나 알 수 없는 값일 때의 보기 방식 */
export const DEFAULT_GOODS_VIEW_MODE: GoodsViewMode = "items";

/** 저장된 문자열을 보기 방식으로 읽는다. 없거나 모르는 값(다른 버전이 쓴 값)이면 기본값. */
export function parseGoodsViewMode(raw: string | null): GoodsViewMode {
  return raw === "items" || raw === "gachas" ? raw : DEFAULT_GOODS_VIEW_MODE;
}

/**
 * 기기 설정 (내 굿즈 보기 방식). 최근 기록처럼 키-값 저장소(앱은 AsyncStorage)에 둔다. 구현은 preferences.storage.ts.
 * 쓰기가 실패하면 그대로 던진다.
 */
export interface PreferencesRepository {
  getGoodsViewMode(): Promise<GoodsViewMode>;
  /** 저장한 값을 돌려준다 */
  setGoodsViewMode(mode: GoodsViewMode): Promise<GoodsViewMode>;
}
