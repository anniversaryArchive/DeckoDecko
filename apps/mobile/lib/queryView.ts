/** React Query 결과 중 QueryState 가 보는 것만. 화면이 @tanstack/react-query 에 직접 기대지 않게 모양만 받는다. */
export type QueryLike<T> = {
  data: T | undefined;
  isLoading: boolean;
  /** 새 키를 불러오는 동안 이전 결과를 대신 들고 있는지 (keepPreviousData 를 쓰는 검색) */
  isPlaceholderData?: boolean;
  isError: boolean;
  /** 오프라인이라 요청을 보내지 않고 기다리는 중 (React Query 의 fetchStatus "paused") */
  isPaused?: boolean;
  refetch: () => unknown;
};

export type QueryView = "offline" | "loading" | "error" | "empty" | "content";

/**
 * 쿼리 하나를 어떤 상태로 그릴지 고른다 (QueryState).
 * - 오프라인으로 멈췄는데(isPaused) 받은 적 있는 값이 없으면 offline. 멈춘 쿼리는 isLoading 이 false 다.
 *   "없음"으로 확정된 null 캐시는 받은 값이라 offline 이 아니다 (React Query 도 undefined 만 데이터 없음으로 본다).
 * - 로딩은 isLoading 으로 본다. 꺼진 쿼리(빈 id · 빈 검색어)는 isPending 이 계속 true 라서다.
 * - 이전 결과를 대신 들고 있는 동안(isPlaceholderData)도 로딩이다. 그 결과로 "결과 없음"을 그리면 새 검색어의 결과처럼 보인다.
 * - 캐시가 있으면 오프라인이어도 content 다 (오프라인은 루트의 배너가 알린다).
 */
export function queryView<T>(
  query: QueryLike<T>,
  isEmpty?: (data: NonNullable<T>) => boolean
): QueryView {
  if (query.isPaused && (query.data === undefined || query.isPlaceholderData)) return "offline";
  if (query.isLoading || query.isPlaceholderData) return "loading";
  if (query.isError) return "error";
  if (query.data == null || isEmpty?.(query.data)) return "empty";
  return "content";
}
