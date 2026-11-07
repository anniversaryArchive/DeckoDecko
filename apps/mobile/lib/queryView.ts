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
 * QueryState 가 무엇을 그릴지 고른다. 위에서부터 먼저 맞는 것이 이긴다.
 *   offline  오프라인이라 멈췄고, 보여 줄 데이터가 없다
 *   loading  불러오는 중이거나, 새 검색어를 불러오는 동안 이전 검색어의 결과만 들고 있다
 *   error    불러오지 못했다
 *   empty    받은 데이터가 비었다 ("없음"으로 받은 null 도 여기)
 *   content  그 밖. 오프라인이어도 캐시가 있으면 여기로 온다 (오프라인은 배너가 알린다)
 * 주의: 멈춘 쿼리는 isLoading 이 false 라 offline 을 loading 보다 먼저 본다.
 * 로딩을 isPending 이 아니라 isLoading 으로 보는 건, 꺼진 쿼리(빈 id · 빈 검색어)는 isPending 이 계속 true 라서다.
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
