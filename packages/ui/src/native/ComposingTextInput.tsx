import { useLayoutEffect, useRef, useState, type ComponentType, type Ref } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { useMergedRef } from "./useMergedRef";

export type ComposingTextInputProps = TextInputProps & {
  /** 실제로 그릴 입력창. 기본은 TextInput, BottomSheet 안에서는 BottomSheetTextInput 을 넘긴다 */
  as?: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  ref?: Ref<TextInput>;
};

/**
 * 한글 · 일본어 조합이 끊기지 않는 TextInput. `value` 를 넘겨도 TextInput 에는 넘기지 않고, 친 글자는 입력창이 들고 있는다.
 * iOS 새 아키텍처는 value 가 들어오면 조합 중인 글자를 덮어써서 "가나" 가 "ㄱㅏㄴㅏ" 로 들어간다 (react-native#56082).
 * 화면이 친 글자와 다른 value 를 넣을 때만 반영한다: 빈 값은 clear(), 그 밖(다른 기록 불러오기 등)은 입력창을 다시 만든다.
 * onChangeText 로 받은 글자는 그대로 value 로 돌려줘야 한다. 거절하면 입력창과 value 가 어긋나고, 바꿔 돌려주면 글자마다 다시 만들어져 키보드가 닫힌다.
 * `maxLength` 는 조합 중에도 잘라서 끝 글자가 깨질 수 있으니 길이 제한이 꼭 필요한 곳에만 쓴다.
 */
export function ComposingTextInput({
  as: Field = TextInput,
  ref,
  value,
  defaultValue,
  onChangeText,
  ...rest
}: ComposingTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const setRef = useMergedRef(inputRef, ref);
  const controlled = value !== undefined;
  // 입력창 안에 지금 있는 글자
  const shownText = useRef(value ?? defaultValue ?? "");
  // 입력창을 다시 만들 때 넣을 글자와 key
  const [seed, setSeed] = useState({ text: value ?? defaultValue ?? "", key: 0 });

  // commit 과 같은 동기 구간에서 돌려, 다음 글자 이벤트가 사이에 끼어 옛 value 로 판단하는 일이 없게 한다
  useLayoutEffect(() => {
    if (!controlled || value === shownText.current) return;
    shownText.current = value;
    if (value === "") inputRef.current?.clear();
    else setSeed((prev) => ({ text: value, key: prev.key + 1 }));
  }, [controlled, value]);

  return (
    <Field
      key={seed.key}
      {...rest}
      ref={setRef}
      defaultValue={seed.text}
      onChangeText={(text) => {
        shownText.current = text;
        onChangeText?.(text);
      }}
    />
  );
}
