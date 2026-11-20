import { useCallback, type Ref } from "react";

/** 여러 ref 에 같은 요소를 연결하는 콜백 ref. ref 가 바뀌지 않으면 같은 함수를 돌려줘서 렌더마다 떼었다 붙지 않는다 */
export function useMergedRef<T>(...refs: (Ref<T> | undefined)[]) {
  return useCallback((el: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    }
  }, refs);
}
