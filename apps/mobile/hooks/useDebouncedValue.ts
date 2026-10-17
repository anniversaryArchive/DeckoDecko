import { useEffect, useState } from "react";

/**
 * value 가 delayMs 동안 바뀌지 않으면 그 값을 돌려준다. 검색 입력 디바운스용.
 * flushWhen 이 true 인 값(예: 빈 검색어)은 기다리지 않고 바로 반영한다.
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs = 300,
  flushWhen?: (value: T) => boolean
): T {
  const [debounced, setDebounced] = useState(value);
  const flush = flushWhen?.(value) ?? false;
  // 렌더 중에 맞춰 둔다 (effect 에서 바꾸면 이전 값으로 한 번 더 그려진다)
  if (flush && !Object.is(debounced, value)) setDebounced(value);

  useEffect(() => {
    if (flush) return;
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs, flush]);

  return flush ? value : debounced;
}
