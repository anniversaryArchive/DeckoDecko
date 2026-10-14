import { createMemoryGachaRepository, type Repositories } from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

/**
 * 백오피스가 쓰는 저장소 묶음. 서버 컴포넌트 · 서버 액션은 이 객체의 함수를 직접 await 한다.
 * 1주차는 목 데이터. 운영 화면(공지 1.0 4주차, 카탈로그 1.2)을 만들 때 Supabase 저장소로 바꾼다.
 * 쓰기(service role)는 여기가 아니라 서버 액션 전용 모듈에서 따로 만든다.
 */
export const repositories: Repositories = {
  gacha: createMemoryGachaRepository(mockCatalog),
};
