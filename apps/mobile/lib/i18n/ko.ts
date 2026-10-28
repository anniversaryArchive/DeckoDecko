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
    // formatPercent 가 쓴다
    percent: "{{value, number}}%",
    appName: "가챠 탐색대",
    back: "뒤로",
    last10Days: "최근 10일",
    // 가챠 정보 줄 (검색 결과 카드 · 상세). 값은 포맷 헬퍼로 만든 문자열을 넣는다.
    pricePerPlay: "1회 {{price}}",
    taxIncluded: "(세금 포함)",
    released: "{{month}} 발매",
    itemTotal: "전 {{total}}",
    close: "닫기",
    // 토스트(ToastProvider)의 iOS 화면 읽기 안내. 동작 결과를 적는다 (제스처 이름은 VoiceOver 가 붙인다)
    closeToastHint: "알림을 닫아요",
  },
  startup: {
    // 로컬 DB 마이그레이션 실패 (루트 레이아웃의 실패 화면)
    localDbFailed: "내 굿즈 기록을 불러오지 못했어요.\n다시 시도해 주세요.",
  },
  home: {
    title: "홈",
    collectionRate: "내 굿즈 소장률",
    viewGoods: "내 굿즈 보기",
    // 소장률 카드의 개수 칩. 값은 formatNumber 로 만든 문자열을 넣는다
    getCount: "GET {{value}}",
    wishCount: "WISH {{value}}",
    noticeBadge: "공지",
    noticeAll: "공지 전체보기",
    newArrivals: "새로 나왔어요",
    newBadge: "NEW",
    popular: "지금 인기",
    empty: "아직 등록된 가챠가 없어요.",
  },
  search: {
    title: "검색",
    placeholder: "상품명 · 작품명으로 검색",
    submit: "검색",
    clear: "검색어 지우기",
    popularTitle: "인기 검색 굿즈",
    // <bold> 는 화면의 Trans 가 굵은 Text 로 바꾼다
    resultCount_one: "총 <bold>{{count, number}}</bold>개",
    resultCount_other: "총 <bold>{{count, number}}</bold>개",
    noResult: "'{{keyword}}' 결과가 없어요",
    noResultHint: "작품명이나 상품명 일부만 입력해 보세요.\n아직 등록되지 않은 가챠일 수도 있어요.",
  },
  detail: {
    title: "가챠 상세",
    notFound: "없는 가챠예요 (id: {{id}})",
    collectionTitle: "이 가챠 소장률",
    collectionOwned: "{{count, number}}",
    // 큰 숫자(가진 수) 뒤에 붙는 보조 문구: "3 / 6 · 50%"
    collectionRest: " / {{total, number}} · {{rate, number}}%",
    // 소장률 바 전체의 화면 읽기 이름
    collectionLabel: "{{total, number}}종 중 {{count, number}}종 소장, {{rate, number}}%",
    collectionGet: "GET {{count, number}}",
    collectionWish: "WISH {{count, number}}",
    collectionMissing: "미등록 {{count, number}}",
    noLineup: "아직 라인업 정보가 없어요",
    myItems: "내 아이템 {{count, number}}",
    myItemsEmpty: "아직 기록한 아이템이 없어요.\n아이템 추가로 WISH · GET 을 남겨 보세요.",
    hasMemo: "메모 있음",
    addItem: "아이템 추가",
    aiScan: "사진으로 인식해서 추가",
    toggleHint: "태그를 누르면 WISH ↔ GET",
    // 태그 버튼의 화면 읽기 이름. type 은 WISH · GET
    toggleLabel: "{{name}} 상태 전환, 현재 {{type}}",
    saveFailed: "저장하지 못했어요",
    reopenSheet: "다시 열기",
  },
  goods: {
    title: "내 굿즈",
    empty: "아직 저장된 가챠가 없어요.",
  },
  folder: {
    // 폴더 선택 시트 (아이템 시트에서 연다)
    selectTitle: "폴더 선택",
    // 기본 폴더는 DB 에 이름이 비어 있어 이 문구로 보인다
    defaultName: "기본 폴더",
    // 포맷 헬퍼(formatFolderItemCount)가 쓴다
    itemCount_one: "아이템 {{count, number}}개",
    itemCount_other: "아이템 {{count, number}}개",
    newFolder: "새 폴더",
    createLabel: "새 폴더 만들기",
    namePlaceholder: "폴더 이름",
    create: "만들기",
    nameHint: "같은 이름의 폴더는 만들 수 없어요",
    nameTaken: "이미 같은 이름의 폴더가 있어요",
    createFailed: "폴더를 만들지 못했어요",
  },
  notice: {
    title: "공지사항",
    // 공지 목록 화면이 생기기 전까지 자리에 보이는 문구
    comingSoon: "공지 목록은 준비 중이에요.",
  },
  settings: {},
  feedback: {},
} as const;
