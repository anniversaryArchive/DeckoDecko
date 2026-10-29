// 앱이 넘긴 값(검색어 · id · 개수 · 필터 · 정렬) → PostgREST 요청 값

import type { GachaSort, ResolvedGachaFilter } from "./gacha";

/**
 * 검색어를 `col.ilike."%...%"` 의 값으로 만든다.
 * LIKE 와일드카드(% _)와 \ 는 글자 그대로 찾도록 이스케이프하고,
 * PostgREST 는 like · ilike 값의 * 를 % 로 바꾸고 이스케이프할 방법이 없어서, * 는 아무 한 글자(_)로 찾는다.
 * or() 문법을 깨는 , ( ) . : 가 들어 있어도 되게 큰따옴표로 감싼다 (안쪽의 " 와 \ 는 다시 이스케이프).
 */
export function toIlikeValue(keyword: string): string {
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&").replace(/\*/g, "_")}%`;
  return `"${pattern.replace(/["\\]/g, "\\$&")}"`;
}

/** 여러 컬럼 중 하나라도 부분 일치하면 맞는 or() 조건. */
export function ilikeAny(columns: readonly string[], keyword: string): string {
  const value = toIlikeValue(keyword);
  return columns.map((column) => `${column}.ilike.${value}`).join(",");
}

/**
 * DB id 는 bigint. 숫자가 아닌 id 는 요청하지 않고 없는 것으로 본다.
 * "007" 처럼 앞에 0 이 붙은 id 도 없는 것으로 본다 (받으면 돌려주는 id "7" 과 캐시 키가 어긋난다).
 */
export function toDbId(id: string): number | null {
  if (!/^(0|[1-9]\d*)$/.test(id)) return null;
  const n = Number(id);
  return Number.isSafeInteger(n) ? n : null;
}

/** PostgREST 조건 하나 (`.filter(column, operator, value)` 에 그대로 넘긴다). */
export type FilterCondition = {
  column: string;
  operator: "eq" | "gt" | "gte" | "lte";
  value: string;
};

/**
 * 결과 필터를 PostgREST 조건으로 바꾼다. 모두 AND. 맞을 수 없는 조건(숫자가 아닌 작품 id)이면 null.
 * release_month 는 그 달 1일 날짜라서 신상품은 이번 달 1일과 같은 것, 발매 예정은 그보다 늦은 것이다.
 * gte · lte · eq · gt 는 NULL 과 비교하면 거짓이라, 발매월 · 가격을 모르는 가챠는 해당 조건에서 저절로 빠진다 (메모리 구현과 같다).
 */
export function toFilterConditions(
  filter: ResolvedGachaFilter,
  thisMonth: string
): FilterCondition[] | null {
  const conditions: FilterCondition[] = [];
  const firstDay = `${thisMonth}-01`;
  if (filter.release === "new") {
    conditions.push({ column: "release_month", operator: "eq", value: firstDay });
  } else if (filter.release === "upcoming") {
    conditions.push({ column: "release_month", operator: "gt", value: firstDay });
  }
  if (filter.mediaId != null) {
    const animeId = toDbId(filter.mediaId);
    if (animeId === null) return null;
    conditions.push({ column: "anime_id", operator: "eq", value: String(animeId) });
  }
  if (filter.priceMin != null) {
    conditions.push({ column: "price", operator: "gte", value: String(filter.priceMin) });
  }
  if (filter.priceMax != null) {
    conditions.push({ column: "price", operator: "lte", value: String(filter.priceMax) });
  }
  return conditions;
}

/** 정렬 하나 (`.order(column, { ascending, nullsFirst: false })`). */
export type OrderBy = { column: string; ascending: boolean };

/** 값이 같을 때의 순서: 최근 등록순. 목록(listGacha)과 같다. */
const RECENT_FIRST: readonly OrderBy[] = [
  { column: "created_at", ascending: false },
  { column: "id", ascending: false },
];

/**
 * 검색 정렬을 order 목록으로 바꾼다. 모르는(null) 값은 어느 정렬이든 맨 뒤 (nullsFirst: false 로 쓴다).
 * 모르는 정렬 값이면 발매일순.
 */
export function toOrderBy(sort: GachaSort | undefined): readonly OrderBy[] {
  switch (sort) {
    case "priceAsc":
      return [{ column: "price", ascending: true }, ...RECENT_FIRST];
    case "priceDesc":
      return [{ column: "price", ascending: false }, ...RECENT_FIRST];
    default:
      return [{ column: "release_month", ascending: false }, ...RECENT_FIRST];
  }
}
