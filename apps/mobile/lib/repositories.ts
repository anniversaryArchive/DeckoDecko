import { createMemoryGachaRepository, type Repositories } from "@deckodecko/core";

import { mockCatalog } from "@/mocks/catalog";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * 1주차는 목 데이터. 2주차에 Supabase 저장소(createSupabaseGachaRepository)로 바꾼다. 화면 코드는 그대로다.
 */
export const repositories: Repositories = {
  gacha: createMemoryGachaRepository(mockCatalog),
};
