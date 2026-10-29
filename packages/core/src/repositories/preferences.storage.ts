import { storageKeys } from "../storageKeys";
import { parseGoodsViewMode, type PreferencesRepository } from "./preferences";
import type { KeyValueStorage } from "./recent.storage";

/** 키-값 저장소 위의 기기 설정 저장소. 키는 storageKeys 에서만 꺼낸다. */
export function createStoragePreferencesRepository(
  storage: KeyValueStorage
): PreferencesRepository {
  return {
    async getGoodsViewMode() {
      return parseGoodsViewMode(await storage.getItem(storageKeys.goodsViewMode));
    },
    async setGoodsViewMode(mode) {
      await storage.setItem(storageKeys.goodsViewMode, mode);
      return mode;
    },
  };
}
