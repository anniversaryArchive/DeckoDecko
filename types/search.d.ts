// gacha + anime 조인 결과 아이템 타입 정의
export interface IGachaItem {
  id: number;
  name_kr: string;
  name: string;
  image_link: string;
  anime_id?: number | null;
  anime_kr_title?: string | null;
  total_count: number;  // 추가
}

export interface SearchResult {
  items: IGachaItem[];
  totalCount: number;
}

export interface IGoodsItem {
  id: string;
  title: string;
  subtitle: string;
  anime?: string | null;
  imgUrl?: string;
}
