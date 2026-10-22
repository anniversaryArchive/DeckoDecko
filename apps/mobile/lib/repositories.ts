import { createMemoryGachaRepository, type Repositories } from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * 가챠 카탈로그는 아직 목 데이터. 2주차에 Supabase 저장소(createSupabaseGachaRepository)로 바꾼다. 화면 코드는 그대로다.
 * WISH / GET 기록 · 폴더는 기기 로컬 DB (lib/db).
 */
export const repositories: Repositories = {
  gacha: createMemoryGachaRepository(mockCatalog),
  ...localRepositories,
};
