import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createMemoryFeedbackRepository,
  createMemoryGachaRepository,
  createMemoryMediaRepository,
  createMemoryNoticeRepository,
  createSupabaseClient,
  createSupabaseGachaRepository,
  createStoragePreferencesRepository,
  createSupabaseMediaRepository,
  createStorageRecentRepository,
  type LocalRepositories,
  type PreferencesRepository,
  type RecentRepository,
  type Repositories,
} from "@deckodecko/core";
import { mockCatalog, mockMedia, mockNotices } from "@deckodecko/core/mocks";

import { localRepositories } from "./db/local";
import { getDeviceId } from "./deviceId";

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
    media: createSupabaseMediaRepository(client),
    recent,
    preferences,
    ...devNotice(),
    ...devFeedback(),
    ...localRepositories,
  };
}

function createMockRepositories(): AppRepositories {
  return {
    gacha: createMemoryGachaRepository(mockCatalog),
    media: createMemoryMediaRepository(mockMedia),
    recent,
    preferences,
    ...devNotice(),
    ...devFeedback(),
    ...localRepositories,
  };
}

// Supabase 공지 저장소가 생기기 전까지 공지는 개발 빌드에서만 목 데이터다. 출시 빌드는 공지를 빼서 홈 공지 띠가 숨는다.
function devNotice(): Pick<Repositories, "notice"> {
  return __DEV__ ? { notice: createMemoryNoticeRepository(mockNotices) } : {};
}

// feedback 테이블(#185) 전까지 요청 · 문의는 개발 빌드에서만 메모리 저장소다. 출시 빌드는 넘기지 않아 화면이 보내기 진입점을 숨긴다
// (메모리 저장소를 출시 빌드에 넣으면 보낸 내용이 앱을 끌 때 사라진다).
function devFeedback(): Pick<Repositories, "feedback"> {
  return __DEV__ ? { feedback: createMemoryFeedbackRepository({ getDeviceId }) } : {};
}

// Repositories 는 로컬 기록 · recent · preferences 가 선택이라, 앱에서는 빠뜨리면 typecheck 에서 잡히게 필수로 좁힌다.
type AppRepositories = Repositories &
  LocalRepositories &
  Required<Pick<Repositories, "media">> & {
    recent: RecentRepository;
    preferences: PreferencesRepository;
  };

export const repositories: AppRepositories = createRepositories();
