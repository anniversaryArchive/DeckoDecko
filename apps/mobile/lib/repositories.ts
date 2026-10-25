import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createMemoryGachaRepository,
  createStorageRecentRepository,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * 1주차는 목 데이터. 2주차에 Supabase 저장소(createSupabaseGachaRepository)로 바꾼다. 화면 코드는 그대로다.
 * 최근 검색어 · 최근 본 가챠는 기기 AsyncStorage (키는 @deckodecko/core 의 storageKeys 한 곳에서 관리).
 */
export const repositories: Repositories = {
  gacha: createMemoryGachaRepository(mockCatalog),
  recent: createStorageRecentRepository(AsyncStorage),
};
