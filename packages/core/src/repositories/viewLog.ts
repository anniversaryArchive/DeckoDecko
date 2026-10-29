/**
 * 가챠 상세 조회 로그 (인기 집계의 근거). 서버가 기기 · 가챠 · 날짜당 1건만 남기지만,
 * 같은 날 다시 들어올 때마다 요청하지 않도록 구현이 앱이 켜져 있는 동안 dailyOnce 로 한 번 더 거른다.
 */
export interface ViewLogRepository {
  /** 실패하면 던진다. 같은 날 같은 가챠는 한 번만 보내고, 실패한 것은 다음 호출에서 다시 보낸다 */
  logGachaView(gachaId: string): Promise<void>;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 서버의 gacha_view_log.viewed_on 과 같은 기준(서울 날짜, "YYYY-MM-DD"). 기기 시간대와 상관없다 */
export function viewLogDay(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * send 를 가챠 · 날짜마다 한 번만 부르는 함수로 감싼다. 보내는 중에 다시 부르면 같은 요청을 기다린다.
 * 실패하면 기억을 지워 다음 호출에서 다시 보낸다. 기억은 메모리에 그날 것만 둔다 (앱을 다시 켜면 서버가 거른다).
 */
export function dailyOnce(
  send: (gachaId: string) => Promise<void>,
  today: () => string = () => viewLogDay()
): (gachaId: string) => Promise<void> {
  let sentDay = "";
  const sent = new Map<string, Promise<void>>();
  return (gachaId) => {
    const day = today();
    if (day !== sentDay) {
      sent.clear();
      sentDay = day;
    }
    const prev = sent.get(gachaId);
    if (prev) return prev;
    const request = send(gachaId).catch((error: unknown) => {
      if (sent.get(gachaId) === request) sent.delete(gachaId);
      throw error;
    });
    sent.set(gachaId, request);
    return request;
  };
}
