import type { Notice } from "../types";

/**
 * 개발용 목 공지. Supabase 공지 저장소가 생기기 전까지 홈 공지 띠가 이 데이터로 돈다.
 * 고정 공지 2개(홈 띠에 보임)와 고정 아닌 공지 1개(목록에만 보임). 프로덕션 번들에는 import 하지 않는다.
 */
export const mockNotices: Notice[] = [
  {
    id: "n-oct-new-arrivals",
    title: "10월 신상 가챠 12종 업데이트 안내",
    content: "10월에 나온 가챠 12종을 추가했어요. 홈의 '새로 나왔어요'에서 확인해 보세요.",
    isFixed: true,
    createdAt: "2026-10-20T01:00:00Z",
  },
  {
    id: "n-welcome",
    title: "가챠 탐색대에 오신 것을 환영해요",
    content: "갖고 싶은 굿즈는 WISH, 뽑은 굿즈는 GET 으로 기록해 보세요.",
    isFixed: true,
    createdAt: "2026-10-01T01:00:00Z",
  },
  {
    id: "n-request-guide",
    title: "찾는 가챠가 없다면 등록을 요청해 주세요",
    content: "설정 › 요청 · 문의에서 가챠 이름과 사진을 보내 주시면 확인 후 추가할게요.",
    isFixed: false,
    createdAt: "2026-10-10T01:00:00Z",
  },
];
