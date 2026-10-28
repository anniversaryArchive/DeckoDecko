import {
  createMemoryGachaRepository,
  createMemoryNoticeRepository,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog, mockNotices } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * WISH / GET 기록 · 폴더는 기기 로컬 DB (lib/db).
 * TODO(혜진): #142 에서 가챠 카탈로그를 목 데이터 대신 Supabase 저장소로 바꾼다. 화면 코드는 그대로다.
 * 공지는 Supabase 공지 저장소가 생기기 전까지 개발 빌드에서만 목 데이터를 쓴다. 출시 빌드는 공지를 빼서 홈 공지 띠가 숨는다.
 */
export const repositories: Repositories = {
  gacha: createMemoryGachaRepository(mockCatalog),
  ...(__DEV__ ? { notice: createMemoryNoticeRepository(mockNotices) } : {}),
  ...localRepositories,
};
