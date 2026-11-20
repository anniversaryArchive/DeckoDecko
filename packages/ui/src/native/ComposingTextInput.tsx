import { useLayoutEffect, useRef, useState, type ComponentType, type Ref } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { useMergedRef } from "./useMergedRef";

/** value 로 돌아오길 기다리는 글자를 몇 개까지 기억할지 */
const MAX_SENT_TEXTS = 20;

export type ComposingTextInputProps = TextInputProps & {
  /** 실제로 그릴 입력창. 기본은 TextInput, BottomSheet 안에서는 BottomSheetTextInput 을 넘긴다 */
  as?: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  ref?: Ref<TextInput>;
};

/**
 * 한글 · 일본어 조합이 끊기지 않는 TextInput. `value` 를 넘겨도 TextInput 에는 넘기지 않고, 친 글자는 입력창이 들고 있는다.
 * iOS 새 아키텍처는 value 가 들어오면 조합 중인 글자를 덮어써서 "가나" 가 "ㄱㅏㄴㅏ" 로 들어간다 (react-native#56082).
 * 화면이 친 글자와 다른 value 를 넣을 때만 반영한다: 빈 값은 clear(), 그 밖(다른 기록 불러오기 등)은 입력창을 다시 만든다.
 * 최근에 보내고 아직 value 로 돌아오지 않은 글자와 같은 값은 늦게 온 value 로 보고 반영하지 않는다 (한 프레임 안에 지웠다 같은 글자를 다시 친 직후 화면이 그 값을 넣는 경우는 구분하지 못한다).
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
  // 화면에 보낸 글자들 (보낸 순서, 마지막으로 돌아온 글자부터)
  const sentTexts = useRef<string[]>([]);
  // 입력창을 다시 만들 때 넣을 글자와 key
  const [seed, setSeed] = useState({ text: value ?? defaultValue ?? "", key: 0 });

  // value 가 그대로인 commit 에서도 돌아야 한꺼번에 그려져 건너뛴 글자가 목록에 남지 않는다. 그리기 전에 clear() · key 교체를 끝내려고 layout effect
  useLayoutEffect(() => {
    if (!controlled) return;
    // BottomSheet(portal) 안에서는 value 가 한 단계 늦게 돌아와 뒤 글자를 친 뒤에 앞 글자가 온다. 내가 보낸 글자면 입력창을 그대로 둔다
    const sent = sentTexts.current.indexOf(value);
    if (sent !== -1) {
      // 같은 value 로 다시 그려질 수 있으니 방금 맞춘 글자는 남긴다
      sentTexts.current = sentTexts.current.slice(sent);
      return;
    }
    sentTexts.current = [];
    if (value === shownText.current) return;
    shownText.current = value;
    if (value === "") {
      inputRef.current?.clear();
      // 한 번도 치지 않은 입력창은 다시 그릴 때 옛 defaultValue 가 네이티브로 다시 가서 지운 글자가 돌아온다 (Android 시트)
      setSeed((prev) => (prev.text === "" ? prev : { text: "", key: prev.key }));
    } else setSeed((prev) => ({ text: value, key: prev.key + 1 }));
  });

  return (
    <Field
      key={seed.key}
      {...rest}
      ref={setRef}
      defaultValue={seed.text}
      onChangeText={(text) => {
        shownText.current = text;
        // 화면이 value 를 돌려주지 않아도 끝없이 쌓이지 않게 최근 것만 둔다
        sentTexts.current = [...sentTexts.current.slice(-(MAX_SENT_TEXTS - 1)), text];
        onChangeText?.(text);
      }}
    />
  );
}
