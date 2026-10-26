import type { Notice } from "../types";
import { NOTICE_DEFAULTS } from "./notice";
import type { ListNoticesParams, NoticeRepository } from "./notice";

/** 양의 정수가 아니면(0 · 음수 · 소수 · NaN) 기본값 */
function limitOr(n: number | undefined, fallback: number): number {
  return n !== undefined && Number.isInteger(n) && n >= 1 ? n : fallback;
}

/** 고정 공지 먼저, 같은 묶음 안에서는 최신순. 작성 시각이 같으면 받은 순서를 지킨다 (sort 는 안정 정렬). */
function byFixedThenLatest(a: Notice, b: Notice): number {
  if (a.isFixed !== b.isFixed) return a.isFixed ? -1 : 1;
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

/**
 * 메모리 안의 배열로 동작하는 공지 저장소. Supabase 저장소가 생기기 전까지 앱(목 데이터)과 테스트에 쓴다.
 * 데이터는 호출하는 쪽이 넘긴다 (개발용 목 데이터: @deckodecko/core/mocks 의 mockNotices).
 */
export function createMemoryNoticeRepository(seed: readonly Notice[]): NoticeRepository {
  const all = [...seed].sort(byFixedThenLatest);

  return {
    async listNotices(params?: ListNoticesParams) {
      const list = params?.fixedOnly ? all.filter((n) => n.isFixed) : all;
      return list
        .slice(0, limitOr(params?.limit, NOTICE_DEFAULTS.listLimit))
        .map((n) => ({ ...n }));
    },

    async getNotice(id: string) {
      const found = all.find((n) => n.id === id);
      return found ? { ...found } : null;
    },
  };
}
