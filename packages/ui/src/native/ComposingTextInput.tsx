import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type Ref,
} from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

type AnyFn = (...args: unknown[]) => unknown;

export type ComposingTextInputProps = TextInputProps & {
  /** 실제로 그릴 입력창. 기본은 TextInput, BottomSheet 안에서는 BottomSheetTextInput 을 넘긴다 */
  as?: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  ref?: Ref<TextInput>;
};

type FieldProps = TextInputProps & {
  Field: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  fieldRef: Ref<TextInput>;
};

function sameStyle(a: TextInputProps["style"], b: TextInputProps["style"]) {
  if (a === b) return true;
  const fa = (StyleSheet.flatten(a) ?? {}) as Record<string, unknown>;
  const fb = (StyleSheet.flatten(b) ?? {}) as Record<string, unknown>;
  const keys = Object.keys(fa);
  return keys.length === Object.keys(fb).length && keys.every((k) => fa[k] === fb[k]);
}

// 쓰는 쪽이 style 을 렌더마다 새 객체로 넘겨도 값이 같으면 다시 그리지 않는다
const Field = memo(
  function Field({ Field: Component, fieldRef, ...props }: FieldProps) {
    return <Component {...props} ref={fieldRef} />;
  },
  (prev, next) => {
    const keys = Object.keys(prev) as (keyof FieldProps)[];
    if (keys.length !== Object.keys(next).length) return false;
    return keys.every((k) =>
      k === "style" ? sameStyle(prev.style, next.style) : prev[k] === next[k]
    );
  }
);

/**
 * 한글 · 일본어 조합이 끊기지 않는 TextInput. `value` 를 넘겨도 처음 값만 입력창에 넣고, 그 뒤로는 입력창이 글자를 들고 있는다.
 * iOS 새 아키텍처는 조합 중에 value 나 props 가 다시 들어오면 조합을 지워서 "가나" 가 "ㄱㅏㄴㅏ" 로 들어간다 (react-native#56082).
 * 화면이 친 글자와 다른 value 를 넣으면(비우기, 다른 기록 불러오기) 그때만 입력창에 반영한다: 빈 값은 clear(), 그 밖은 입력창을 다시 만든다.
 * 함수 props 는 한 번만 만든 함수로 바꿔 넘겨서, 부모가 글자마다 다시 그려져도 입력창은 다시 그려지지 않는다.
 * `maxLength` 는 조합 중에도 잘라서 끝 글자가 깨질 수 있으니 길이 제한이 꼭 필요한 곳에만 쓴다.
 */
export function ComposingTextInput({
  as = TextInput,
  ref,
  value,
  defaultValue,
  ...rest
}: ComposingTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const controlled = value !== undefined;
  const shownText = useRef(value ?? defaultValue ?? "");
  const [seed, setSeed] = useState({ text: value ?? defaultValue ?? "", key: 0 });

  useEffect(() => {
    if (!controlled || value === shownText.current) return;
    shownText.current = value;
    if (value === "") inputRef.current?.clear();
    else setSeed((prev) => ({ text: value, key: prev.key + 1 }));
  }, [controlled, value]);

  const latest = useRef(rest);
  useLayoutEffect(() => {
    latest.current = rest;
  });
  const [stableFns] = useState(() => new Map<string, AnyFn>());
  const stable = (name: string) => {
    let fn = stableFns.get(name);
    if (!fn) {
      fn = (...args: unknown[]) =>
        (latest.current as Record<string, AnyFn | undefined>)[name]?.(...args);
      stableFns.set(name, fn);
    }
    return fn;
  };
  const fieldProps: Record<string, unknown> = {};
  for (const [name, prop] of Object.entries(rest)) {
    fieldProps[name] = typeof prop === "function" ? stable(name) : prop;
  }

  const handleChangeText = useCallback((text: string) => {
    shownText.current = text;
    latest.current.onChangeText?.(text);
  }, []);
  const setRef = useCallback(
    (el: TextInput | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  return (
    <Field
      key={seed.key}
      Field={as}
      fieldRef={setRef}
      {...(fieldProps as TextInputProps)}
      defaultValue={seed.text}
      onChangeText={handleChangeText}
    />
  );
}
