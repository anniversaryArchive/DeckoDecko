/**
 * 앱 · 백오피스가 쓰는 도메인 타입. DB 컬럼(snake_case)을 그대로 노출하지 않고 여기 모양으로 바꿔서 내보낸다.
 * DB 와의 대응은 Supabase repository(2주차)에서 한 번만 한다.
 */

export type MediaKind = "anime" | "game" | "character";

/** 작품 (애니 · 게임 · 캐릭터). 가챠가 속한 단위이고 검색 필터 · 상세 상단 칩에 보인다. */
export type Media = {
  id: string;
  title: string; // 한국어 이름
  titleJa: string | null;
  titleEn: string | null;
  kind: MediaKind | null;
  imageUrl: string | null;
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

/** 공지사항 (운영자가 백오피스에서 작성). 홈 공지 띠 · 공지 목록 · 상세에 보인다. */
export type Notice = {
  id: string;
  title: string;
  content: string; // DB 칼럼 이름은 body
  /** 고정 공지. 목록 맨 위에 오고, 홈 공지 띠는 고정 공지만 보인다 (DB is_fixed) */
  isFixed: boolean;
  createdAt: string; // ISO 8601 UTC
};

/** WISH = 갖고 싶음, GET = 가졌음. 목록 · 상세에서 원탭으로 바꾼다 (useSetItemType). */
export type ItemType = "WISH" | "GET";

/**
 * 사용자가 기기에 남긴 WISH / GET 기록 한 건 (로컬 DB items). 가챠 라인업(GachaItem)과는 별개다.
 * 라인업 아이템을 id 로 가리키지 않고 이름으로 적는다. 같은 가챠 안에서 이름이 겹치면 시트가 막는다 (normalizeName 기준).
 */
export type Item = {
  id: string; // 기기에서 만든 UUID
  gachaId: string; // Supabase 가챠 id. 원격 DB 라 외래 키로 묶지 않는다
  folderId: string; // 폴더를 고르지 않으면 기본 폴더
  type: ItemType;
  name: string; // 앞뒤 공백만 지우고 입력한 모양 그대로 저장
  thumbnail: string | null; // 사진의 로컬 파일 URI (file://)
  memo: string | null;
  createdAt: string; // ISO 8601 UTC. 목록은 이것의 역순
  updatedAt: string;
};

/** 내 굿즈 폴더. 기본 폴더는 하나뿐이고 name 이 비어 있다 (표시 이름은 화면에서 i18n 키로). */
export type Folder = {
  id: string;
  name: string;
  sequence: number; // 폴더 목록의 표시 순서 (작을수록 앞). 기본 폴더가 0, 새 폴더는 MAX + 1. 값이 연속이라는 보장은 없다
  isDefault: boolean; // 지우거나 이름을 바꿀 수 없다. 지운 폴더의 기록이 여기로 옮겨진다
  createdAt: string; // ISO 8601 UTC
};

/** 종류별 기록 개수. 소장률(collectionRate)의 입력 */
export type ItemCounts = {
  wish: number;
  get: number;
};
