import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export type DbClient = SupabaseClient<Database>;

/**
 * anon key 로 쓰는 Supabase 클라이언트. 환경변수는 이 패키지가 읽지 않고 호출하는 쪽이 넘긴다.
 *   앱:       EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
 *   백오피스: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 세션 저장을 끈 읽기 전용 용도다. 운영자 로그인이 필요한 백오피스는 apps/admin 에서 쿠키 기반 클라이언트를 따로 만든다.
 * service role 키는 어디서도 이 함수에 넣지 않는다.
 */
export function createSupabaseClient(
  url: string | undefined,
  anonKey: string | undefined
): DbClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase URL 과 anon key 가 비어 있다. .env.example 을 복사해 EXPO_PUBLIC_* 또는 NEXT_PUBLIC_* 값을 채운다."
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
