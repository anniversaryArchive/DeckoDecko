import { BottomSheetTextInput, useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";

import { useTheme } from "../theme";
import { border, fonts, radius, space, typography } from "../tokens";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";
import { Text } from "./Text";

/** 한 줄 입력창 높이 */
const HEIGHT = 48;
/** 지우기 버튼 지름 */
const CLEAR_SIZE = 32;
/** 지우기 버튼 안 × 크기 */
const CLEAR_ICON_SIZE = 12;
/** 여러 줄(메모) 입력창 최소 높이 */
const MULTILINE_MIN_HEIGHT = 72;

export type InputProps = Omit<TextInputProps, "style"> & {
  /** 입력창 위 이름 ("아이템 이름") */
  label?: string;
  /** 입력창 아래 안내 ("같은 이름의 아이템이 있으면 알려드려요") */
  helperText?: string;
  /** 입력창 안 왼쪽 (폴더 아이콘 등) */
  leading?: ReactNode;
  /** 입력창 안 오른쪽 (아이콘 등) */
  trailing?: ReactNode;
  /** 글자가 있을 때 오른쪽에 지우기 버튼을 그린다. 기본은 켜짐, 여러 줄 · 읽기 전용에서는 그리지 않는다 */
  clearable?: boolean;
  /** 지우기 버튼을 화면 읽기 프로그램이 읽을 이름 ("지우기"). 컴포넌트 안에 문구를 두지 않으므로 화면에서 넘긴다 */
  clearLabel?: string;
  /** 바깥 상자(이름 · 입력창 · 안내 묶음)의 스타일 */
  style?: StyleProp<ViewStyle>;
};

/**
 * 이름 · 메모 입력창. 입력 중일 때 테두리가 포인트 색이 된다.
 * BottomSheet 안에 넣으면 키보드가 올라올 때 시트도 같이 올라가도록 시트용 입력창으로 바꿔 그린다.
 * TextInput 은 글꼴을 하나만 쓸 수 있어서 Noto Sans KR 로 고정한다 (영어 · 숫자도 Noto Sans KR 로 보인다).
 */
export function Input({
  label,
  helperText,
  leading,
  trailing,
  clearable = true,
  clearLabel,
  multiline,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const inSheet = useBottomSheetInternal(true) !== null;
  const Field = inSheet ? BottomSheetTextInput : TextInput;
  const inputRef = useRef<TextInput>(null);
  // value 를 넘기지 않는(defaultValue 만 쓰는) 입력창도 지우기 버튼이 보이도록 글자가 있는지 따로 기억한다
  // value 를 넘기는(제어) 입력창은 글자를 칠 때마다 다시 그려지지 않게 이 상태를 바꾸지 않는다
  const controlled = rest.value !== undefined;
  const [uncontrolledText, setUncontrolledText] = useState(rest.defaultValue ?? "");
  const hasText = controlled ? (rest.value ?? "").length > 0 : uncontrolledText.length > 0;
  // 시트용 입력창과 기본 입력창의 ref 타입이 조금 달라서(null / undefined) 둘 다 받는 함수로 넘긴다.
  // 렌더마다 새 함수를 만들면 ref 가 매번 떼었다 붙어서 한 번만 만든다.
  const setInputRef = useCallback((el: TextInput | null | undefined) => {
    inputRef.current = el ?? null;
  }, []);
  const showClear = clearable && !multiline && rest.editable !== false && hasText;

  return (
    <View style={[{ gap: space[6] }, style]}>
      {label ? (
        <Text variant="caption" weight="bold" color="textMuted">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          gap: space[8],
          minHeight: multiline ? MULTILINE_MIN_HEIGHT : HEIGHT,
          height: multiline ? undefined : HEIGHT,
          paddingLeft: space[14],
          // 지우기 버튼이 있으면 오른쪽 여백을 줄여 버튼이 테두리 가까이 붙게 한다 (시안)
          paddingRight: showClear ? space[8] : space[14],
          paddingVertical: multiline ? space[10] : 0,
          borderRadius: radius.field,
          borderWidth: border.default,
          borderColor: focused ? colors.primary : colors.line,
          backgroundColor: colors.surface,
        }}
      >
        {leading}
        <Field
          placeholderTextColor={colors.textPlaceholder}
          selectionColor={colors.accent}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...rest}
          ref={setInputRef}
          onChangeText={(text) => {
            if (!controlled) setUncontrolledText(text);
            rest.onChangeText?.(text);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            alignSelf: "stretch",
            padding: 0,
            fontFamily: fonts.sans.regular,
            fontSize: typography.body.fontSize,
            color: colors.text,
          }}
        />
        {trailing}
        {showClear ? (
          <IconButton
            size={CLEAR_SIZE}
            label={clearLabel}
            onPress={() => {
              inputRef.current?.clear();
              if (!controlled) setUncontrolledText("");
              rest.onChangeText?.("");
            }}
          >
            <CloseIcon size={CLEAR_ICON_SIZE} />
          </IconButton>
        ) : null}
      </View>
      {helperText ? (
        <Text variant="captionSm" color="textMuted">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
