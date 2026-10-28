import {
  createMemoryGachaRepository,
  createSupabaseClient,
  createSupabaseGachaRepository,
  type LocalRepositories,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";

// 모드 규칙은 README 의 "데이터 소스". process.env.EXPO_PUBLIC_* 는 번들 때 값으로 바뀌므로 구조 분해하지 않는다.
function createRepositories(): AppRepositories {
  if (__DEV__ && process.env.EXPO_PUBLIC_DATA_SOURCE === "mock") return createMockRepositories();

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
    ...localRepositories,
  };
}

function createMockRepositories(): AppRepositories {
  return {
    gacha: createMemoryGachaRepository(mockCatalog),
    ...localRepositories,
  };
}

// Repositories 는 로컬 기록이 Partial 이라, 앱에서는 빠뜨리면 typecheck 에서 잡히게 필수로 좁힌다.
type AppRepositories = Repositories & LocalRepositories;

export const repositories: AppRepositories = createRepositories();
