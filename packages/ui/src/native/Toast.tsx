import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../theme";
import { radius, space } from "../tokens";
import { AlertIcon } from "./icons";
import { PRESSED_OPACITY } from "./pressable";
import { Text } from "./Text";

/** 왼쪽 아이콘 원 지름 */
const ICON_CIRCLE = 32;
/** 원 안 느낌표 크기 */
const ICON_SIZE = 18;
/** 오른쪽 동작 버튼 높이 */
const ACTION_HEIGHT = 32;
/** 저절로 사라지기까지 기본 시간(ms) */
const DEFAULT_DURATION = 4000;
/** 나타나고 사라지는 시간(ms) */
const ANIMATION_DURATION = 200;

export type ToastOptions = {
  /** 굵은 첫 줄 ("저장하지 못했어요") */
  title: string;
  /** 둘째 줄 설명 */
  message?: string;
  /** 넘기면 오른쪽에 동작 버튼을 그린다 ("다시 열기"). 누르면 onAction 뒤에 토스트가 닫힌다 */
  actionLabel?: string;
  onAction?: () => void;
  /** 저절로 사라지기까지(ms). null 이면 저절로 사라지지 않는다. 생략하면 4초 */
  duration?: number | null;
};

type ToastApi = {
  /** 토스트를 띄운다. 이미 떠 있으면 새 내용으로 바꾸고 시간을 다시 잰다 */
  show: (options: ToastOptions) => void;
  /** 떠 있는 토스트를 닫는다 */
  hide: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/**
 * 토스트를 띄울 자리. 앱 루트 레이아웃에서 화면 전체(내비게이션 머리글 · 바텀 시트 포함)를 한 번 감싼다.
 * 토스트는 화면 맨 위, 상태 바 바로 아래(머리글과 같은 높이)에 겹쳐 그려진다.
 * 화면에서는 useToast().show({ title, … }) 로 띄운다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  // id: 같은 내용을 다시 띄워도 새 토스트로 그려 시간을 다시 잰다
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const nextId = useRef(0);
  const show = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
  }, []);
  const hide = useCallback(() => setToast(null), []);
  const api = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* 토스트 밖은 아래 화면을 그대로 누를 수 있다 */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {toast ? <ToastView key={toast.id} {...toast} onDismiss={hide} /> : null}
      </View>
    </ToastContext.Provider>
  );
}

/** 토스트를 띄우고 닫는다. ToastProvider 안에서만 쓴다 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api)
    throw new Error("useToast 는 ToastProvider 안에서 써야 한다 (apps/mobile/app/_layout.tsx)");
  return api;
}

/** 어두운 면에 느낌표 · 제목 · 설명 · 동작 버튼 (시안 "저장하지 못했어요") */
function ToastView({
  title,
  message,
  actionLabel,
  onAction,
  duration = DEFAULT_DURATION,
  onDismiss,
}: ToastOptions & { onDismiss: () => void }) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (duration === null) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  // iOS 의 화면 읽기 프로그램은 새로 그려진 alert 를 저절로 읽지 않아서 직접 알린다 (Android 는 accessibilityLiveRegion)
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AccessibilityInfo.announceForAccessibility(message ? `${title}. ${message}` : title);
  }, [title, message]);

  return (
    <Animated.View
      entering={FadeInUp.duration(ANIMATION_DURATION)}
      exiting={FadeOutUp.duration(ANIMATION_DURATION)}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={{
        position: "absolute",
        top: insets.top + space[8],
        left: space[20],
        right: space[20],
        flexDirection: "row",
        alignItems: "center",
        gap: space[12],
        paddingVertical: space[12],
        paddingHorizontal: space[14],
        borderRadius: radius.row,
        backgroundColor: colors.inverse,
        boxShadow: shadows.toast,
      }}
    >
      <View
        style={{
          width: ICON_CIRCLE,
          height: ICON_CIRCLE,
          borderRadius: radius.full,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertIcon size={ICON_SIZE} color="onAccent" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="label" weight="bold" color="onInverse">
          {title}
        </Text>
        {message ? (
          <Text variant="caption" color="onInverseMuted">
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            // 먼저 닫는다. onAction 안에서 show() 로 띄운 새 토스트를 이어지는 닫기가 지우지 않게
            onDismiss();
            onAction();
          }}
          hitSlop={space[6]}
          style={({ pressed }) => ({
            height: ACTION_HEIGHT,
            paddingHorizontal: space[12],
            borderRadius: radius.full,
            // 어두운 면 위의 밝은 버튼: 반전 면의 글자색을 면으로 쓴다
            backgroundColor: colors.onInverse,
            justifyContent: "center",
            opacity: pressed ? PRESSED_OPACITY : 1,
          })}
        >
          <Text variant="caption" weight="bold" color="inverse" numberOfLines={1}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
