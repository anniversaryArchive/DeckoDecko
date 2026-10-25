/**
 * 앱 · 백오피스가 쓰는 도메인 타입. DB 컬럼(snake_case)을 그대로 노출하지 않고 여기 모양으로 바꿔서 내보낸다.
 * DB 와의 대응은 Supabase repository(2주차)에서 한 번만 한다.
 */

export type MediaKind = "anime" | "game" | "character";

/**
 * 작품 (애니 · 게임 · 캐릭터). 가챠가 속한 단위이고 검색 필터 · 상세 상단 칩에 보인다.
 * 작품 이미지는 DB 에 컬럼이 없어 두지 않는다 (#160).
 */
export type Media = {
  id: string;
  title: string; // 한국어 이름
  titleJa: string | null;
  titleEn: string | null;
  kind: MediaKind | null;
};

/** 가챠 한 종의 라인업 아이템. WISH / GET 기록의 기본 단위. */
export type GachaItem = {
  id: string;
  gachaId: string;
  number: number; // 라인업 순번 (1부터)
  name: string; // 원문(일본어) 이름
  nameKo: string | null;
  imageUrl: string | null;
};

/** 목록 · 검색 결과에 쓰는 가챠 요약 */
export type Gacha = {
  id: string;
  name: string; // 원문(일본어) 이름
  nameKo: string | null;
  imageUrl: string | null;
  media: Media | null;
  price: number | null; // 엔 단위. 모르면 null
  releaseMonth: string | null; // "YYYY-MM"
  itemCount: number | null;
};

/** 상세 화면용: 요약 + 라인업 */
export type GachaDetail = Gacha & {
  items: GachaItem[];
};

export type Page<T> = {
  items: T[];
  total: number;
};
