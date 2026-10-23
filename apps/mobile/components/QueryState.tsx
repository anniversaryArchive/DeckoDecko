import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { StateMessage } from "./StateMessage";

/** React Query 결과 중 여기서 보는 것만. 화면이 @tanstack/react-query 에 직접 기대지 않게 모양만 받는다. */
type QueryLike<T> = {
  data: T | undefined;
  isLoading: boolean;
  /** 새 키를 불러오는 동안 이전 결과를 대신 들고 있는지 (keepPreviousData 를 쓰는 검색) */
  isPlaceholderData?: boolean;
  isError: boolean;
  refetch: () => unknown;
};

type Props<T> = {
  query: QueryLike<T>;
  /** 받은 데이터가 비었는지. 생략하면 null · undefined 만 빈 것으로 본다 */
  isEmpty?: (data: NonNullable<T>) => boolean;
  /** 비었을 때 그릴 것 (문구 한 줄이면 StateMessage, 큰 안내면 EmptyState) */
  empty: ReactNode;
  /** 로딩 · 에러를 화면 전체 가운데에 둔다 (상세) */
  fill?: boolean;
  children: (data: NonNullable<T>) => ReactNode;
};

/**
 * 쿼리 하나의 로딩 · 에러(다시 시도) · 빈 상태 · 내용을 고른다.
 * 로딩은 isLoading 으로 본다. 꺼진 쿼리(빈 id · 빈 검색어)는 isPending 이 계속 true 라서다.
 * 이전 결과를 대신 들고 있는 동안(isPlaceholderData)도 로딩이다. 그 결과로 "결과 없음"을 그리면 새 검색어의 결과처럼 보인다.
 */
export function QueryState<T>({ query, isEmpty, empty, fill, children }: Props<T>) {
  const { t } = useTranslation();
  if (query.isLoading || query.isPlaceholderData) {
    return <StateMessage fill={fill} loading message={t("common.loading")} />;
  }
  if (query.isError) {
    return (
      <StateMessage
        fill={fill}
        message={t("common.loadFailed")}
        onRetry={() => void query.refetch()}
      />
    );
  }
  const data = query.data;
  if (data == null || isEmpty?.(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}
