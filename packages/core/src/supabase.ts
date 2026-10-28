import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const REQUEST_TIMEOUT_MS = 15_000;

/** 생성 타입을 붙인 Supabase 클라이언트. 저장소 구현(<도메인>.supabase.ts)만 받는다. */
export type DeckoSupabaseClient = SupabaseClient<Database>;

/**
 * publishable key(`sb_publishable_...`) 로 읽기 전용 클라이언트를 만든다.
 * 환경변수는 이 패키지가 읽지 않고 앱 · 백오피스가 넘긴다. `sb_publishable_` 로 시작하지 않는 키(secret · legacy anon · service_role)는 던진다.
 *   - 아직 로그인이 없어서 세션을 저장 · 갱신하지 않는다. 저장하려면 RN 에는 localStorage 가 없어
 *     AsyncStorage 패키지를 따로 넣어야 한다. 인증을 붙일 때 다시 정한다.
 *   - 재시도는 React Query(createQueryClient 의 retry 1)가 맡는다. supabase-js 의 DB 쿼리 부분(postgrest-js)도
 *     기본으로 재시도(최대 3번, 1 · 2 · 4초)를 해서, 둘이 겹치면 실패할 때 에러 상태가 그만큼 늦게 뜬다.
 *   - 응답이 없을 때 무한정 기다리지 않게 요청 시간 제한을 둔다.
 * fetch 는 테스트에서만 바꿔 끼운다.
 */
export function createSupabaseClient(
  url: string,
  publishableKey: string,
  options?: { fetch?: typeof fetch }
): DeckoSupabaseClient {
  if (!publishableKey.startsWith("sb_publishable_")) {
    throw new Error(
      "publishable key(sb_publishable_...) 만 넘긴다. secret · legacy 키는 클라이언트에 넣을 수 없다."
    );
  }
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { retry: false, timeout: REQUEST_TIMEOUT_MS },
    global: options?.fetch ? { fetch: options.fetch } : undefined,
  });
}
