import { QueryClient } from "@tanstack/react-query";

/**
 * 앱 · 백오피스 공통 기본값.
 *   staleTime 5분: 카탈로그(가챠 · 작품 · 공지)는 운영자가 바꿀 때만 변하므로 화면을 오갈 때마다 다시 받지 않는다.
 *                  기기 기록(WISH / GET)은 로컬 DB 훅이 저장 직후 invalidate 해서 이 값과 무관하다.
 *   retry 1:       모바일 네트워크에서 한 번만 재시도하고 바로 오류 상태로 보여 준다.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/**
 * 기기 안에 저장하는 데이터(WISH · GET 기록 · 폴더 · 최근 기록 · 설정)를 읽고 쓰는 훅에만 펼쳐 넣는다.
 * 기본값이면 오프라인에서 기기 저장까지 멈춰서, 네트워크와 상관없이 늘 실행하게 한다.
 * 서버(Supabase)에서 받는 훅에는 넣지 않고 serverNetworkMode 를 넣는다.
 * 넣었으면 local.hooks.test.tsx 처럼 오프라인으로 도는 테스트를 같이 쓴다.
 * 이 패키지의 lint 가 훅마다 둘 중 하나를 넣었는지 검사한다 (eslint.config.js).
 */
export const localNetworkMode = { networkMode: "always" } as const;

/**
 * 서버(Supabase)에서 받는 데이터(가챠 · 공지 등)의 훅에 펼쳐 넣는다. React Query 기본값과 같다.
 * 오프라인이면 요청을 보내지 않고 멈췄다가, 다시 연결되면 이어서 불러온다 (화면에는 오프라인 안내).
 */
export const serverNetworkMode = { networkMode: "online" } as const;
