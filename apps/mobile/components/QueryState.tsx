import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { recheckNetworkState } from "@/lib/network";
import { queryView, type QueryLike } from "@/lib/queryView";

import { StateMessage } from "./StateMessage";

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

/** 쿼리 하나의 오프라인 · 로딩 · 에러(다시 시도) · 빈 상태 · 내용을 고른다. 고르는 규칙은 lib/queryView.ts */
export function QueryState<T>({ query, isEmpty, empty, fill, children }: Props<T>) {
  const { t } = useTranslation();
  switch (queryView(query, isEmpty)) {
    case "offline":
      return (
        <StateMessage fill={fill} message={t("common.offlineLoad")} onRetry={recheckNetworkState} />
      );
    case "loading":
      return <StateMessage fill={fill} loading message={t("common.loading")} />;
    case "error":
      return (
        <StateMessage
          fill={fill}
          message={t("common.loadFailed")}
          onRetry={() => void query.refetch()}
        />
      );
    case "empty":
      return <>{empty}</>;
    case "content":
      // queryView 가 content 를 고르면 data 는 null 이 아니다. 타입만 좁힌다
      return query.data == null ? null : <>{children(query.data)}</>;
  }
}
