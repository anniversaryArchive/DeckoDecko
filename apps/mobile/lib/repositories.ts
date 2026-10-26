import {
  createMemoryGachaRepository,
  createSupabaseClient,
  createSupabaseGachaRepository,
  type LocalRepositories,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";

/**
 * 앱이 쓰는 저장소 묶음. 루트 레이아웃의 CoreProvider 에 넘긴다.
 * 화면은 훅만 쓰고, 데이터가 목 데이터에서 오는지 Supabase 에서 오는지는 여기서만 정한다.
 * WISH / GET 기록 · 폴더는 어느 쪽이든 기기 로컬 DB (lib/db).
 *
 * 기본은 Supabase (EXPO_PUBLIC_SUPABASE_URL · EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, publishable key 만).
 * 개발 빌드에서 EXPO_PUBLIC_DATA_SOURCE=mock 이면 목 데이터(메모리 저장소)를 쓴다. 네트워크 없이 화면을 볼 때 쓴다.
 * 출시 빌드는 이 값을 무시한다 (EAS 환경변수에 mock 이 잘못 들어가도 실제 데이터를 쓰게).
 * 개발 중에 Supabase 값이 없으면 경고를 남기고 목 데이터로 돈다. 개발 빌드가 아니면 바로 실패시킨다.
 *
 * process.env.EXPO_PUBLIC_* 는 번들 때 값으로 바뀌므로 구조 분해하지 않고 하나씩 적는다.
 */
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

export const repositories: Repositories = createRepositories();
