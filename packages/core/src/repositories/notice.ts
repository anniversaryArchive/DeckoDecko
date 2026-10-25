import type { Notice } from "../types";

/**
 * 인자를 생략했을 때의 기본값. 구현과 훅(쿼리 키)이 같은 값을 쓰도록 여기 둔다.
 * limit 이 양의 정수가 아니면(0 · 음수 · 소수 · NaN) 생략한 것으로 보고 이 값을 쓴다.
 */
export const NOTICE_DEFAULTS = {
  listLimit: 20,
  /** 홈 공지 띠 (고정 공지만) */
  homeLimit: 2,
} as const;

export type ListNoticesParams = {
  limit?: number; // 기본 20
  /** 고정 공지만. 홈 공지 띠가 쓴다 (홈 띠에 보일지를 따로 고르지 않고, 고정 = 홈 띠) */
  fixedOnly?: boolean;
};

/**
 * 공지 읽기. 쓰기는 백오피스 서버 쪽에서만 한다 (AGENTS.md 보안).
 *   지금: createMemoryNoticeRepository (목 데이터)
 *   다음: createSupabaseNoticeRepository (notice 테이블)
 */
export interface NoticeRepository {
  /** 고정 공지 먼저, 각각 최신순. fixedOnly 면 고정 공지만 최신순 (홈 공지 띠) */
  listNotices(params?: ListNoticesParams): Promise<Notice[]>;
  getNotice(id: string): Promise<Notice | null>; // 없으면 null
}
