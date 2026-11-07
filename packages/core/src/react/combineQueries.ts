/** 쿼리 여러 개를 합친 훅이 화면의 QueryState 에 넘길 상태 */
export type QueryStatus = { isLoading: boolean; isError: boolean };

type RefetchableQuery = QueryStatus & { refetch: () => Promise<unknown> };

/** 하나라도 불러오는 중이면 isLoading, 하나라도 실패하면 isError */
export function combineQueryStatus(queries: readonly QueryStatus[]): QueryStatus {
  return {
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}

/** 다시 시도: 실패한 쿼리를 모두 다시 부른다. 실패한 것이 없으면 전부 */
export function refetchQueries(queries: readonly RefetchableQuery[]): () => Promise<unknown> {
  return () => {
    const failed = queries.filter((q) => q.isError);
    return Promise.all((failed.length > 0 ? failed : queries).map((q) => q.refetch()));
  };
}
