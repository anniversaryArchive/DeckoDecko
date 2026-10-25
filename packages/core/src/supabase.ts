import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const REQUEST_TIMEOUT_MS = 15_000;

/** 생성 타입을 붙인 Supabase 클라이언트. 저장소 구현(<도메인>.supabase.ts)만 받는다. */
export type DeckoSupabaseClient = SupabaseClient<Database>;

/**
 * publishable key(`sb_publishable_...`) 로 읽기 전용 클라이언트를 만든다.
 * 환경변수는 이 패키지가 읽지 않고 앱 · 백오피스가 넘긴다. secret key 는 여기에 넘기지 않는다.
 *   - 아직 로그인이 없어서 세션 저장 · 갱신을 끈다 (RN 에서 AsyncStorage 없이 돌게 하려는 것도 있다). 인증을 붙일 때 다시 정한다.
 *   - 재시도는 React Query(createQueryClient 의 retry 1)가 맡는다. postgrest-js 기본 재시도(최대 3번, 1 · 2 · 4초)를 겹치면
 *     오프라인일 때 에러 상태가 한참 늦게 뜬다.
 *   - 응답이 없을 때 무한정 기다리지 않게 요청 시간 제한을 둔다.
 * fetch 는 테스트에서만 바꿔 끼운다.
 */
export function createSupabaseClient(
  url: string,
  publishableKey: string,
  options?: { fetch?: typeof fetch }
): DeckoSupabaseClient {
  if (publishableKey.startsWith("sb_secret_")) {
    throw new Error("secret key 는 클라이언트에 넣을 수 없다. publishable key 를 넘긴다.");
  }
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { retry: false, timeout: REQUEST_TIMEOUT_MS },
    global: options?.fetch ? { fetch: options.fetch } : undefined,
  });
}
