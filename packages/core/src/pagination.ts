import type { Page } from "./types";

/**
 * offset 무한 스크롤 도우미. React 없이 쓰는 순수 함수라 훅(./react)과 테스트가 같이 쓴다.
 * 페이지는 { items, total } 이고, 다음 페이지의 offset 은 지금까지 받은 개수다.
 */

/**
 * 다음 페이지를 가져올 offset. 끝이면 undefined (React Query 의 getNextPageParam 규칙).
 * 마지막 페이지가 비었으면 total 이 남았다고 해도 끝으로 본다 (그사이 데이터가 줄어 무한히 요청하는 걸 막는다).
 */
export function nextPageOffset<T>(pages: readonly Page<T>[]): number | undefined {
  const last = pages[pages.length - 1];
  if (!last || last.items.length === 0) return undefined;
  const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
  return loaded < last.total ? loaded : undefined;
}

/**
 * 받은 페이지들을 한 목록으로 잇는다. total 은 가장 최근에 받은 페이지 값을 쓴다.
 * offset 방식은 그사이 데이터가 바뀌면 같은 항목이 두 페이지에 걸칠 수 있어 id 로 한 번만 남긴다.
 */
export function flattenPages<T extends { id: string }>(pages: readonly Page<T>[]): Page<T> {
  const seen = new Set<string>();
  const items: T[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  }
  return { items, total: pages[pages.length - 1]?.total ?? 0 };
}
