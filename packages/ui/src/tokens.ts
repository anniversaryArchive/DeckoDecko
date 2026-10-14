/**
 * 디자인 토큰. 세 층으로 나뉜다.
 *   palette  — 원색 값. 화면 코드에서 직접 쓰지 않는다.
 *   Theme    — 역할(배경, 글자, 포인트, WISH/GET …)에 palette 를 배정한 것. 테마마다 한 벌, `themes/` 폴더에 파일 하나씩.
 *   공통     — fonts, typography, space, radius, border 는 테마와 무관하게 하나.
 * 이 파일에는 Theme 의 모양(타입)만 두고, 테마 값은 themes/ 에 둔다. 새 테마 추가 방법은 themes/index.ts 참고.
 * 화면 코드는 useTheme() 로 받은 역할 이름만 쓴다.
 * 값의 출처는 디자인 캔버스(https://claude.ai/artifact/H59s4ezb8jvh6ttSpJ4mpW)의 화면들이다.
 */

export const palette = {
  cream: "#FFF9F4",
  creamDeep: "#F6ECE4",
  white: "#FFFFFF",
  sand: "#F1E4DA",
  blush: "#FFF1EA",
  blushLine: "#F8D6C9",
  coral: "#D9573F",
  peach: "#FF8E7A",
  peachLight: "#FFE3D8",
  sage: "#CFE8D5",
  sageMid: "#5FA77E",
  sageDeep: "#2E6B4B",
  ink: "#2B2622",
  /** ink 42% — 시트 · 다이얼로그 뒤 배경 */
  inkScrim: "rgba(43, 38, 34, 0.42)",
  stone: "#7A7068",
  pebble: "#A89C93",
  stoneLight: "#C9BDB4",
} as const;

/** 화면이 쓰는 색 역할. 테마가 바뀌어도 이 이름은 그대로다. */
export type ThemeColors = {
  /** 화면 바탕 */
  bg: string;
  /** 카드·시트 면 */
  surface: string;
  /** 카드 테두리, 구분선 */
  line: string;
  /** 카드 안 목록 행 사이 구분선, 썸네일 테두리 (line 보다 연함) */
  lineSoft: string;
  /** 기본 글자 */
  text: string;
  /** 보조 글자 */
  textMuted: string;
  /** 입력창 placeholder */
  textPlaceholder: string;
  /** 가장 흐린 글자 · 아이콘 (화살표, 비활성) */
  textFaint: string;
  /** 포인트 (활성 탭, 링크, 강조 숫자, 삭제 버튼 면) */
  accent: string;
  /** accent 면 위 글자 */
  onAccent: string;
  /** 주요 버튼 면 */
  primary: string;
  /** 주요 버튼 위 글자 */
  onPrimary: string;
  /** 연한 포인트 면 (상세 상단, 칩 배경) */
  accentSoft: string;
  /** 강조 카드 면 / 테두리 (홈 소장률 카드, 로고 타일) */
  highlightBg: string;
  highlightLine: string;
  /** WISH 태그 면 / 글자 */
  wishBg: string;
  wishFg: string;
  /** GET 태그 면 / 글자 */
  getBg: string;
  getFg: string;
  /** GET 진행 막대 · 점 */
  getMark: string;
  /** 반전 면 (토스트) / 그 위 글자 */
  inverse: string;
  onInverse: string;
  /** 시트 · 다이얼로그 뒤를 덮는 반투명 배경 */
  scrim: string;
};

/**
 * 그림자. CSS box-shadow 문자열이라 웹은 그대로, RN(0.76+ New Architecture)은 `boxShadow` 스타일로 쓴다.
 * 그림자 색은 바탕색에 따라 달라지므로(어두운 테마는 더 진하게) 테마마다 정한다.
 */
export type ThemeShadows = {
  /** 상단 토스트 */
  toast: string;
  /** 자동완성 · 드롭다운 팝오버 */
  popover: string;
};

export type Theme = {
  /** 설정 화면 등에 보일 이름 */
  name: string;
  /** 상태 바·시스템 UI 가 밝은 바탕용인지 */
  scheme: "light" | "dark";
  colors: ThemeColors;
  shadows: ThemeShadows;
};

export const fonts = {
  /** 한글 본문. 숫자·영문은 Inter 가 앞에 온다. */
  sans: ["Inter", "Noto Sans KR", "Apple SD Gothic Neo", "system-ui", "sans-serif"] as const,
  weight: { regular: 400, medium: 500, bold: 700 } as const,
} as const;

export type FontWeightName = keyof typeof fonts.weight;

export type TypeStyle = {
  fontSize: number;
  /** px. RN 은 배수를 받지 않으므로 시안의 배수 × 크기를 반올림해 둔다. */
  lineHeight: number;
  /** px */
  letterSpacing: number;
  /** 기본 굵기. 같은 크기에서 굵기만 다르게 쓰는 곳(12px 500 · 700 등)은 컴포넌트에서 바꾼다. */
  weight: FontWeightName;
};

/** 글자 크기 단계. 글꼴(family)은 #110 의 Text 래퍼가 weight 로 고른다. */
export const typography = {
  /** 소장률 같은 큰 숫자 (40) */
  stat: { fontSize: 40, lineHeight: 40, letterSpacing: -1, weight: "bold" },
  /** 스플래시 앱 이름 (28) */
  display: { fontSize: 28, lineHeight: 28, letterSpacing: -0.6, weight: "bold" },
  /** 가챠 상세 제목 (22) */
  title: { fontSize: 22, lineHeight: 30, letterSpacing: -0.4, weight: "bold" },
  /** 탭 화면 머리글 "내 굿즈", "검색" (20) */
  header: { fontSize: 20, lineHeight: 27, letterSpacing: -0.4, weight: "bold" },
  /** 다이얼로그 · 권한 안내 제목 (18) */
  dialogTitle: { fontSize: 18, lineHeight: 25, letterSpacing: 0, weight: "bold" },
  /** 섹션 제목 "새로 나왔어요", 시트 제목 (17) */
  section: { fontSize: 17, lineHeight: 23, letterSpacing: -0.3, weight: "bold" },
  /** 목록 묶음 제목 "최근 검색어" (16) */
  subsection: { fontSize: 16, lineHeight: 22, letterSpacing: 0, weight: "bold" },
  /** 버튼 글자, 공지 제목 (15) */
  button: { fontSize: 15, lineHeight: 21, letterSpacing: 0, weight: "bold" },
  /** 본문 (14) */
  body: { fontSize: 14, lineHeight: 21, letterSpacing: 0, weight: "regular" },
  /** 긴 안내문 · 공지 본문 (14, 줄 간격 넓게) */
  bodyLong: { fontSize: 14, lineHeight: 22, letterSpacing: 0, weight: "regular" },
  /** 카드 · 행의 이름 (14 굵게) */
  bodyStrong: { fontSize: 14, lineHeight: 19, letterSpacing: 0, weight: "bold" },
  /** 라벨, 설정 항목 (13) */
  label: { fontSize: 13, lineHeight: 18, letterSpacing: 0, weight: "medium" },
  /** 보조 설명, 칩 글자 (12) */
  caption: { fontSize: 12, lineHeight: 18, letterSpacing: 0, weight: "regular" },
  /** 메타 정보 "별의 숲 · …", 태그 (11) */
  small: { fontSize: 11, lineHeight: 15, letterSpacing: 0, weight: "regular" },
  /** 배지 "NEW", "AI" (10) */
  tiny: { fontSize: 10, lineHeight: 13, letterSpacing: 0, weight: "bold" },
} as const satisfies Record<string, TypeStyle>;

export type TypographyName = keyof typeof typography;

/**
 * 간격(px). 시안이 2px 단위로 촘촘하게 쓰여 있어 이름 대신 값을 키로 둔다 (`space[12]`).
 * 여기 없는 값은 시안에서 한두 번만 나온 것이라 가까운 단계로 맞춘다.
 */
export const space = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  32: 32,
} as const;

/** 화면 좌우 여백 */
export const gutter = space[24];

/** 모서리(px). 높이의 절반으로 둥근 버튼 · 칩 · 세그먼트 · 검색창은 모두 pill. */
export const radius = {
  /** 진행 막대 */
  bar: 4,
  /** 썸네일, 아이콘 타일 */
  thumb: 12,
  /** 입력창, 시트 안 선택 행, 자동완성 팝오버. 시안의 14 · 16 을 16 으로 통일 */
  field: 16,
  /** 폴더 행 카드, 토스트 */
  row: 18,
  /** 공지 · 문의 목록 카드 */
  tile: 20,
  /** 기본 카드 */
  card: 22,
  /** 홈 강조 카드 */
  banner: 24,
  /** 바텀 시트 위 모서리, 하단 탭 바 */
  sheet: 28,
  pill: 999,
} as const;

/** 테두리 두께(px) */
export const border = {
  /** 카드 · 입력창 · 칩 */
  default: 1.5,
  /** 카드 안 행 구분선, 썸네일 */
  divider: 1,
} as const;
