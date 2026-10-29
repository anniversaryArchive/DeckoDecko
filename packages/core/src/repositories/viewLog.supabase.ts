import type { DeckoSupabaseClient } from "../supabase";
import { toDbId } from "./gacha.supabase.params";
import { dailyOnce } from "./viewLog";
import type { ViewLogRepository } from "./viewLog";

/**
 * log_gacha_view RPC 로 조회 로그를 남긴다. anon 은 로그 테이블에 직접 쓸 수 없다.
 * getDeviceId 는 앱이 넘기는 익명 기기 UUID (createStorageDeviceId). 숫자가 아닌 가챠 id 는 보내지 않는다.
 */
export function createSupabaseViewLogRepository(
  client: DeckoSupabaseClient,
  getDeviceId: () => Promise<string>
): ViewLogRepository {
  return {
    logGachaView: dailyOnce(async (gachaId) => {
      const dbId = toDbId(gachaId);
      if (dbId === null) return;
      const { error } = await client.rpc("log_gacha_view", {
        p_gacha_id: dbId,
        p_device_id: await getDeviceId(),
      });
      if (error) throw new Error(`[viewLog.logGachaView] ${error.message}`, { cause: error });
    }),
  };
}
