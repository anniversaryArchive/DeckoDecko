import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";

import {
  createMemoryGachaRepository,
  createMemoryNoticeRepository,
  createMemoryViewLogRepository,
  createStorageDeviceId,
  createSupabaseClient,
  createSupabaseGachaRepository,
  createStoragePreferencesRepository,
  createStorageRecentRepository,
  createSupabaseViewLogRepository,
  type LocalRepositories,
  type PreferencesRepository,
  type RecentRepository,
  type Repositories,
  type ViewLogRepository,
} from "@deckodecko/core";
import { mockCatalog, mockNotices } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";

// 최근 검색어 · 최근 본 가챠 · 기기 설정은 데이터 소스와 관계없이 기기 AsyncStorage (키는 @deckodecko/core 의 storageKeys).
const recent = createStorageRecentRepository(AsyncStorage);
const preferences = createStoragePreferencesRepository(AsyncStorage);

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
    recent,
    preferences,
    viewLog: createSupabaseViewLogRepository(
      client,
      createStorageDeviceId(AsyncStorage, randomUUID)
    ),
    ...devNotice(),
    ...localRepositories,
  };
}

function createMockRepositories(): AppRepositories {
  return {
    gacha: createMemoryGachaRepository(mockCatalog),
    recent,
    preferences,
    viewLog: createMemoryViewLogRepository(),
    ...devNotice(),
    ...localRepositories,
  };
}

// Supabase 공지 저장소가 생기기 전까지 공지는 개발 빌드에서만 목 데이터다. 출시 빌드는 공지를 빼서 홈 공지 띠가 숨는다.
function devNotice(): Pick<Repositories, "notice"> {
  return __DEV__ ? { notice: createMemoryNoticeRepository(mockNotices) } : {};
}

// Repositories 는 로컬 기록 · recent · preferences · viewLog 가 선택이라, 앱에서는 빠뜨리면 typecheck 에서 잡히게 필수로 좁힌다.
type AppRepositories = Repositories &
  LocalRepositories & {
    recent: RecentRepository;
    preferences: PreferencesRepository;
    viewLog: ViewLogRepository;
  };

export const repositories: AppRepositories = createRepositories();
