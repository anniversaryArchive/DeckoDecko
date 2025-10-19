import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import type {IGachaItem, IGoodsItem} from '@/types/search';


const MAX_RECENT_SEARCHES = 10;
const MAX_RECENT_GOODS = 10;

const SEARCH_STORAGE_KEY = "@recent_searches";
const GOODS_STORAGE_KEY = "@recent_goods";

/**
 * 최근 검색어 저장
 */
export const addRecentSearch = async (searchItem: string) => {
  try {
    // 1. 기존 검색어 목록 불러오기
    let searches = await getRecentSearches();

    // 2. 중복된 검색어 제거 (기존에 있었다면 추가하지않고 맨 위로 올리기 위함)
    searches = searches.filter((item: string) => item !== searchItem);

    // 3. 새로운 검색어를 배열 맨 앞에 추가
    searches.unshift(searchItem);

    // 4. 최대 10개까지만 유지
    const newSearches = searches.slice(0, MAX_RECENT_SEARCHES);
    await AsyncStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(newSearches));
  } catch (e) {
    console.error("로컬 최근 검색어 저장 실패", e);
  }
};

/**
 * 최근 검색어 불러오기
 */
export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const searchesJSON = await AsyncStorage.getItem(SEARCH_STORAGE_KEY);
    return searchesJSON ? JSON.parse(searchesJSON) : [];
  } catch (e) {
    console.error("로컬 최근 검색어 불러오기 실패", e);
    return [];
  }
};

/**
 * 특정 검색어 삭제
 */
export const removeRecentSearch = async (removeItem: string) => {
  try {
    const searches = await getRecentSearches();
    const newSearches = searches.filter((item: string) => item !== removeItem);
    await AsyncStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(newSearches));
  } catch (e) {
    console.error("로컬 최근 검색어 삭제 실패", e);
  }
};

/**
 * 전체 최근 검색어 삭제
 */
export const clearRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem(SEARCH_STORAGE_KEY);
  } catch (e) {
    console.error("로컬 최근 검색어 전체 삭제 실패", e);
  }
};

/**
 * 최근 본 굿즈 추가
 */
export const addRecentGood = async (item: IGoodsItem) => {
  try {
    let goods: IGoodsItem[] = await getRecentGoods();

    goods = goods.filter(good => good.id !== item.id);
    goods.unshift(item);

    const newGoods = goods.slice(0, MAX_RECENT_GOODS);
    await AsyncStorage.setItem(GOODS_STORAGE_KEY, JSON.stringify(newGoods));
  } catch (e) {
    console.error("로컬 최근 본 굿즈 저장 실패", e);
  }
};

/**
 * 최근 본 굿즈 불러오기
 */
export const getRecentGoods = async (): Promise<IGachaItem[]> => {
  try {
    const goodsJSON = await AsyncStorage.getItem(GOODS_STORAGE_KEY);
    return goodsJSON ? JSON.parse(goodsJSON) : [];
  } catch (e) {
    console.error("로컬 최근 본 굿즈 불러오기 실패", e);
    return [];
  }
};

/**
 * 전체 최근 본 굿즈 삭제
 */
export const clearRecentGoods = async () => {
  try {
    await AsyncStorage.removeItem(GOODS_STORAGE_KEY);
  } catch (e) {
    console.error("로컬 최근 본 굿즈 전체 삭제 실패", e);
  }
};


/**
 * gacha 테이블에서 name_kr과 일치하는 데이터 검색 (offset + limit 지원),
 * 각 아이템마다 전체 결과 수 total_count 포함
 */
export const searchGachaAndAnimeByName = async (
  keyword: string,
  limit = 10,
  offset = 0
): Promise<{ items: IGachaItem[]; totalCount: number }> => {
  try {
    const { data, error } = await supabase.rpc("search_gacha_with_anime", {
      keyword,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      console.error("Supabase RPC search error:", error);
      return { items: [], totalCount: 0 };
    }

    const items = (data as IGachaItem[]) || [];

    // total_count는 결과 배열의 첫 요소에서 읽음, 없으면 0 처리
    const totalCount = items.length > 0 ? items[0].total_count || 0 : 0;

    return { items, totalCount };
  } catch (e) {
    console.error("Unexpected error in searchGachaAndAnimeByName:", e);
    return { items: [], totalCount: 0 };
  }
};
