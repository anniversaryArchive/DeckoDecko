import { useEffect, useState } from "react";

/** 이름 중복 검사는 입력이 이만큼(ms) 멈춘 뒤에 한다 */
export const NAME_CHECK_DELAY = 300;

/** value 가 delay(ms) 동안 바뀌지 않으면 따라간다. 처음 값은 기다리지 않는다 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
