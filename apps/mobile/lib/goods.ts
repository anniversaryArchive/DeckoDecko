import { normalizeName, type Gacha, type Item } from "@deckodecko/core";

/** 가챠 하나에 든 기록 (묶어보기 한 줄) */
export type GachaGroup = {
  gachaId: string;
  items: Item[];
};

/**
 * 내 굿즈 목록 검색. 아이템 이름이나 가챠 이름(원문 · 한국어)에 검색어가 들어 있으면 남긴다.
 * 대소문자 · 전각/반각 · 앞뒤 공백은 무시한다 (normalizeName). 검색어가 비면 그대로 돌려준다.
 * 가챠 정보를 아직 못 받았거나 카탈로그에 없는 가챠는 아이템 이름으로만 찾는다.
 */
export function searchGoods(
  items: readonly Item[],
  gachas: ReadonlyMap<string, Pick<Gacha, "name" | "nameKo">>,
  keyword: string
): Item[] {
  const q = normalizeName(keyword);
  if (!q) return [...items];
  return items.filter((item) => {
    const gacha = gachas.get(item.gachaId);
    return [item.name, gacha?.name, gacha?.nameKo].some(
      (text) => text != null && normalizeName(text).includes(q)
    );
  });
}

/** 가챠별로 묶는다. 묶음 순서 · 묶음 안 순서는 받은 순서를 따른다 (최신순 목록이면 최근에 기록한 가챠가 앞). */
export function groupByGacha(items: readonly Item[]): GachaGroup[] {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const group = groups.get(item.gachaId);
    if (group) group.push(item);
    else groups.set(item.gachaId, [item]);
  }
  return [...groups].map(([gachaId, list]) => ({ gachaId, items: list }));
}

/** 폴더 id → 기록 수 */
export function countByFolder(items: readonly Item[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.folderId, (counts.get(item.folderId) ?? 0) + 1);
  return counts;
}
