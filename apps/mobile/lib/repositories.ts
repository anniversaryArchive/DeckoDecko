import {
  createMemoryGachaRepository,
  createSupabaseClient,
  createSupabaseGachaRepository,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * 화면은 훅만 쓰고, 데이터가 목 데이터에서 오는지 Supabase 에서 오는지는 여기서만 정한다.
 *
 * 기본은 Supabase (EXPO_PUBLIC_SUPABASE_URL · EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, publishable key 만).
 * EXPO_PUBLIC_DATA_SOURCE=mock 이면 목 데이터(메모리 저장소)를 쓴다. 네트워크 없이 화면을 볼 때 쓴다.
 * 개발 중에 Supabase 값이 없으면 경고를 남기고 목 데이터로 돈다. 개발 빌드가 아니면 바로 실패시킨다.
 *
 * process.env.EXPO_PUBLIC_* 는 번들 때 값으로 바뀌므로 구조 분해하지 않고 하나씩 적는다.
 */
function createRepositories(): Repositories {
  if (process.env.EXPO_PUBLIC_DATA_SOURCE === "mock") return createMockRepositories();

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    const message =
      "EXPO_PUBLIC_SUPABASE_URL · EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 가 비어 있다 (apps/mobile/.env.example 참고).";
    if (!__DEV__) throw new Error(message);
    console.warn(`${message} 목 데이터로 실행한다.`);
    return createMockRepositories();
  }

  const client = createSupabaseClient(url, publishableKey);
  return {
    gacha: createSupabaseGachaRepository(client),
  };
}

function createMockRepositories(): Repositories {
  return {
    gacha: createMemoryGachaRepository(mockCatalog),
  };
}

export const repositories: Repositories = createRepositories();
