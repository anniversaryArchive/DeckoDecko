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
    // formatShortDate 가 쓴다 (month · day 는 두 자리)
    shortDate: "{{year}}.{{month}}.{{day}}",
    appName: "가챠 탐색대",
    back: "뒤로",
    last10Days: "최근 10일",
    // 가챠 정보 줄 (검색 결과 카드 · 상세). 값은 포맷 헬퍼로 만든 문자열을 넣는다.
    pricePerPlay: "1회 {{price}}",
    taxIncluded: "(세금 포함)",
    released: "{{month}} 발매",
    releaseUpcoming: "{{month}} 발매 예정",
    itemTotal: "전 {{total}}",
    cancel: "취소",
    // 카드 사진 위 배지 (이번 달 발매 · 다음 달 이후 발매)
    badgeNew: "NEW",
    badgeUpcoming: "발매 예정",
    close: "닫기",
    // 입력창 지우기 버튼 (화면 읽기 프로그램이 읽는다)
    clear: "지우기",
    // 토스트(ToastProvider)의 iOS 화면 읽기 안내. 동작 결과를 적는다 (제스처 이름은 VoiceOver 가 붙인다)
    closeToastHint: "알림을 닫아요",
    // 오프라인: 화면 위 배너 한 줄, 캐시가 없는 화면의 안내 (QueryState). 배너가 늘 같이 떠서 안내는 "오프라인"을 다시 말하지 않는다
    offline: "오프라인 상태예요",
    offlineLoad: "인터넷에 연결되면 자동으로 불러와요.",
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
    recentSearchesTitle: "최근 검색어",
    recentGachaTitle: "최근 본 굿즈",
    clearAll: "전체 삭제",
    // "전체 삭제" 버튼의 읽기 이름 (두 섹션에 같은 글자의 버튼이 있어서 무엇을 지우는지 붙인다)
    clearRecentSearches: "최근 검색어 전체 삭제",
    clearRecentGacha: "최근 본 굿즈 전체 삭제",
    removeRecentSearch: "{{keyword}} 삭제",
    // <bold> 는 화면의 Trans 가 굵은 Text 로 바꾼다
    resultCount_one: "총 <bold>{{count, number}}</bold>개",
    resultCount_other: "총 <bold>{{count, number}}</bold>개",
    noResult: "'{{keyword}}' 결과가 없어요",
    noResultHint: "작품명이나 상품명 일부만 입력해 보세요.\n아직 등록되지 않은 가챠일 수도 있어요.",
    // 등록 요청 화면이 생기기 전까지 버튼은 자리만 있고 눌리지 않는다.
    requestRegistration: "이 가챠 등록 요청하기",
    // 결과 없음의 추천 검색어 칩 위 문구 (인기 가챠의 작품명)
    suggestionTitle: "이렇게 검색해 보세요",
    // 결과를 볼 때 제목 옆. 신상품 · 발매 예정의 기준일 (date 는 formatShortDate)
    asOf: "{{date}} 기준",
    // 필터 때문에 0개일 때. 등록 요청 대신 필터를 풀게 한다.
    noFilteredResult: "조건에 맞는 결과가 없어요",
    noFilteredResultHint: "필터를 바꾸거나 초기화해 보세요.",
    resetFilters: "필터 초기화",
    // 결과 위 필터 칩. 전체 · 신상품 · 발매 예정은 하나만 고르고, 작품 · 가격은 시트에서 고른다.
    filter: {
      all: "전체",
      new: "신상품",
      upcoming: "발매 예정",
      media: "작품",
      price: "가격",
    },
    // 가격 시트의 범위. 값은 포맷 헬퍼(formatPrice)로 만든 문자열을 넣는다.
    priceRange: {
      any: "가격 전체",
      upTo: "{{price}} 이하",
      between: "{{min}} ~ {{max}}",
      from: "{{price}} 이상",
    },
    sortTitle: "정렬",
    sort: {
      release: "발매일순",
      priceAsc: "가격 낮은순",
      priceDesc: "가격 높은순",
    },
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
    // 제목 위 한 줄. rate 는 formatPercent 로 만든 문자열
    summary_one: "전체 {{count, number}}개 · 소장률 {{rate}}",
    summary_other: "전체 {{count, number}}개 · 소장률 {{rate}}",
    summaryEmpty: "아직 저장한 가챠가 없어요",
    manageFolders: "폴더 관리",
    // WISH · GET 세그먼트
    typeLabel: "WISH · GET",
    wishTab: "WISH {{count, number}}",
    getTab: "GET {{count, number}}",
    // 폴더 칩
    folderLabel: "폴더",
    allFolders: "전체",
    searchPlaceholder: "내 굿즈 검색",
    // 풀어보기 · 묶어보기 버튼 (화면 읽기 이름)
    viewModeLabel: "보기 방식",
    viewGachas: "가챠별로 묶어보기",
    viewItems: "아이템별로 풀어보기",
    // 묶어보기 한 줄의 개수 배지
    groupCount_one: "{{count, number}}개",
    groupCount_other: "{{count, number}}개",
    // 묶어보기의 폴더 분포 "기본 폴더 1, 별의 숲 2" 의 한 조각
    folderCount: "{{name}} {{count, number}}",
    // 카탈로그에서 사라진 가챠의 이름 자리
    unknownGacha: "정보가 없는 가챠",
    // 가챠 이름 · 이미지 조회 실패 (기록 목록은 그대로 보인다)
    gachaLoadFailed: "가챠 정보를 불러오지 못했어요",
    // 저장된 기록이 하나도 없을 때
    emptyTitle: "저장된 가챠가 없어요",
    emptyDescription: "갖고 싶은 가챠는 WISH, 뽑은 가챠는 GET으로\n저장하면 여기에 모여요.",
    findGacha: "가챠 찾아보기",
    browseHome: "홈에서 신상 가챠 보기",
    // 기록은 있는데 고른 WISH · GET · 폴더에 없을 때
    noMatch: "여기에 저장된 아이템이 없어요",
    noSearchResult: "'{{keyword}}' 결과가 없어요",
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
  item: {
    // 아이템 추가 · 수정 시트 (상세에서 연다)
    addTitle: "아이템 추가",
    editTitle: "아이템 수정",
    typeLabel: "상태",
    wish: "WISH · 갖고 싶어요",
    get: "GET · 소장 중",
    addPhoto: "사진 추가",
    changePhoto: "사진 바꾸기",
    removePhoto: "사진 지우기",
    // 사진이 있을 때 사진 칸의 읽기 이름 · Android 선택 창 제목
    photoOptions: "사진 바꾸기 · 지우기",
    nameLabel: "아이템 이름",
    nameHint: "같은 이름의 아이템이 있으면 알려드려요",
    nameTaken: "이 가챠에 같은 이름의 아이템이 있어요",
    nameCheckFailed: "이름을 확인하지 못했어요. 이름을 다시 입력해 보세요",
    // 수정 시트의 이름 아래 안내. date 는 포맷 헬퍼(formatDate)로 만든 문자열
    registered: "{{date}} 등록",
    registeredWithPhoto: "{{date}} 등록 · 사진 1장",
    folderLabel: "폴더",
    memoLabel: "메모",
    memoPlaceholder: "구매한 곳, 교환 희망 등 메모를 남겨 보세요",
    add: "추가하기",
    save: "저장하기",
    delete: "삭제",
    // 저장 실패 토스트의 둘째 줄 (토스트는 시트를 연 화면이 띄운다)
    saveFailedReason: "잠시 뒤 다시 시도해 주세요.",
    deleteFailed: "삭제하지 못했어요",
    // 사진 사본을 앱에 저장하지 못했을 때 (기록은 저장된 뒤 시트가 닫히고 토스트로 알린다)
    photoSaveFailed: "사진을 저장하지 못했어요",
    photoSaveFailedAdded: "사진 없이 추가했어요. 수정에서 다시 넣어 주세요.",
    photoSaveFailedKept: "사진은 바꾸지 않고 저장했어요.",
    // 삭제 확인 시트
    deleteTitle: "이 아이템을 삭제할까요?",
    deleteMessage: "사진과 메모도 함께 지워지고,\n삭제한 뒤에는 되돌릴 수 없어요.",
    // GET 기록을 지울 때만 보인다. <bold> 는 화면의 Trans 가 굵은 Text 로 바꾼다
    deleteCountChange:
      "이 가챠의 소장 수가 <bold>{{from, number}} → {{to, number}}</bold>로 바뀌어요.",
    wishBadge: "WISH",
    getBadge: "GET",
  },
  notice: {
    title: "공지사항",
    // 공지 목록 화면이 생기기 전까지 자리에 보이는 문구
    comingSoon: "공지 목록은 준비 중이에요.",
  },
  settings: {
    title: "설정",
    language: "언어",
    comingSoon: "준비 중",
    // 화면 읽기용 (준비 중인 언어 줄)
    comingSoonLabel: "{{name}}, 준비 중",
    languageHint:
      "한국어를 고르면 한국어 이름(없으면 일본어 원래 이름)으로, 다른 언어는 일본어 원래 이름으로 보여요.",
  },
  feedback: {},
} as const;
