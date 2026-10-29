import { dailyOnce, viewLogDay } from "./viewLog";
import type { ViewLogRepository } from "./viewLog";

/** 보낸 조회 로그를 메모리에 쌓는 저장소. 목 데이터 모드와 테스트용. 거르는 규칙은 Supabase 구현과 같다 (dailyOnce). */
export function createMemoryViewLogRepository(
  today: () => string = () => viewLogDay()
): ViewLogRepository & { logged(): { gachaId: string; day: string }[] } {
  const logs: { gachaId: string; day: string }[] = [];
  return {
    logGachaView: dailyOnce(async (gachaId) => {
      logs.push({ gachaId, day: today() });
    }, today),
    logged: () => [...logs],
  };
}
