import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createMemoryGachaRepository,
  createStorageRecentRepository,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * WISH / GET 기록 · 폴더는 기기 로컬 DB (lib/db).
 * 최근 검색어 · 최근 본 가챠는 기기 AsyncStorage (키는 @deckodecko/core 의 storageKeys 한 곳에서 관리).
 * TODO(혜진): #142 에서 가챠 카탈로그를 목 데이터 대신 Supabase 저장소로 바꾼다. 화면 코드는 그대로다.
 */
export const repositories: Repositories = {
  gacha: createMemoryGachaRepository(mockCatalog),
  recent: createStorageRecentRepository(AsyncStorage),
  ...localRepositories,
};
