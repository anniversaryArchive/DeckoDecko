// 앱이 넘긴 값(검색어 · id · 개수) → PostgREST 요청 값

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

/** min 이상의 정수가 아니면(음수 · 소수 · NaN 등) 기본값. 메모리 구현과 같은 규칙. */
export function count(n: number | undefined, fallback: number, min = 1): number {
  return n !== undefined && Number.isInteger(n) && n >= min ? n : fallback;
}
