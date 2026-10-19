/**
 * 한국어 문구. 기준 언어라 키는 여기서 먼저 만든다 (en.ts 는 같은 모양이어야 타입 검사를 통과한다).
 * 키는 `화면.요소`. 여러 화면이 같이 쓰는 문구는 common 에 둔다.
 * 아직 문구가 없는 화면도 상위 키를 미리 둔다 (#107 등 화면 작업에서 채운다).
 */
export const ko = {
  common: {
    loading: "불러오는 중…",
    loadFailed: "불러오지 못했어요",
    retry: "다시 시도",
    // 포맷 헬퍼(lib/i18n/format.ts)가 쓴다. 화면에서 직접 쓰지 않는다.
    price: "{{value, number}}엔",
    // 한국어는 단수 · 복수 구분이 없어 보통 _other 만 쓰인다. en 과 키 모양을 맞추려고 _one 도 둔다.
    // 기기에 Intl.PluralRules 가 없으면 i18next 가 count=1 에 _one 을 고르므로 지우지 않는다.
    itemCount_one: "{{count, number}}종",
    itemCount_other: "{{count, number}}종",
  },
  home: {
    title: "홈",
    description: "소장률 · 새로 나왔어요 · 지금 인기 · 공지",
    collectionRate: "내 굿즈 소장률",
    listFailed: "목록을 불러오지 못했어요",
    missingGachaLink: "없는 가챠로 이동 (없음 상태 확인용)",
  },
  search: {
    title: "검색",
    placeholder: "상품명 · 작품명으로 검색",
  },
  detail: {
    title: "가챠 상세",
    notFound: "없는 가챠예요 (id: {{id}})",
  },
  goods: {
    title: "내 굿즈",
    empty: "아직 저장된 가챠가 없어요.",
  },
  folder: {},
  notice: {},
  settings: {},
  feedback: {},
} as const;
