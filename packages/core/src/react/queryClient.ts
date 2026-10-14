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
