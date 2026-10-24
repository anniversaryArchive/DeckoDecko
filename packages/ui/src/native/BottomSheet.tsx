import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BackHandler, Keyboard, Platform, View } from "react-native";
import { Easing, ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../theme";
import { gutter, radius, space } from "../tokens";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";
import { Text } from "./Text";

/** 손잡이 막대 */
const HANDLE = { width: 40, height: 4 } as const;
/** 닫기 버튼 지름 */
const CLOSE_SIZE = 36;
/** 닫기 버튼 안 × 크기 */
const CLOSE_ICON_SIZE = 14;
/** 열고 닫는 데 걸리는 시간(ms) */
const DURATION = 450;
/** iOS 에서 키보드가 내려가기 시작했다는 알림이 오지 않을 때 시트를 닫기까지 기다리는 최대 시간(ms) */
const KEYBOARD_HIDE_TIMEOUT = 300;

export type BottomSheetProps = {
  /** 열려 있는지. 화면의 상태로 연다 */
  open: boolean;
  /**
   * 사용자가 닫았을 때 (아래로 끌기 · 뒤 배경 · 닫기 버튼 · Android 뒤로가기). 여기서 open 을 false 로 바꾼다.
   * 화면이 open 을 false 로 바꿔 닫을 때는 부르지 않는다.
   */
  onClose: () => void;
  /** 시트 제목 ("아이템 추가") */
  title?: string;
  /** 넘기면 제목 오른쪽에 닫기 버튼을 그린다. 화면 읽기 프로그램이 읽을 이름 ("닫기") */
  closeLabel?: string;
  children: ReactNode;
};

/**
 * 아래에서 올라오는 시트. @gorhom/bottom-sheet 의 BottomSheetModal 을 시안 모양으로 감쌌다.
 * 높이는 내용에 맞춘다. 안에 넣은 Input 은 키보드가 올라오면 시트도 같이 올라간다.
 * 앱 루트에 GestureHandlerRootView 와 BottomSheetModalProvider 가 있어야 한다 (apps/mobile/app/_layout.tsx).
 */
export function BottomSheet({ open, onClose, title, closeLabel, children }: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);
  // 라이브러리 기본값(iOS 스프링)은 Reanimated 4 에서 거의 순간이동처럼 보여서, 시간이 정해진 움직임으로 바꾼다.
  // 천천히 출발해 천천히 멈추는 곡선. 감속만 하는 곡선(cubic-out 등)은 처음 0.1초에 거의 다 움직여 "뿅" 하고 나타나 보인다.
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: DURATION,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  // 시트가 떠 있는지 (present() 부터 닫힘이 끝날 때까지). 라이브러리 상태와 화면의 open 은 닫히는 동안 서로 다르다.
  // 한 번도 열지 않은 시트에 dismiss() 를 부르면 그 뒤의 present() 가 무시된다 (@gorhom/bottom-sheet 5.2).
  // 그래서 떠 있을 때만 닫는다.
  const presented = useRef(false);
  // 화면이 마지막으로 넘긴 open. 닫힘이 끝났을 때 그사이 다시 열렸는지 본다.
  const openRef = useRef(open);
  openRef.current = open;
  // 이번 닫힘을 화면이 시작했는지 (open 을 false 로 바꿈). 그때는 onClose 를 부르지 않는다.
  const closedByParent = useRef(false);
  // 시트가 다 열렸는지 (onChange). 그 전의 닫기 요청은 미뤄 뒀다가 다 열리면 닫는다.
  // - present() 는 다음 프레임에 동작해서, 그 전에 dismiss() 를 부르면 라이브러리가 그리기를 건너뛰고 onDismiss 도 오지 않아 이후로 다시 열리지 않는다.
  // - 열리기 시작할 때(onAnimate)는 시트가 아직 닫힌 위치라, 이때 dismiss() 를 부르면 라이브러리가 이미 그 위치라고 보고 닫지 않는다 (iOS).
  const shown = useRef(false);
  // 다 열리기 전에 사용자가 Android 뒤로가기를 눌렀는지. 다 열리면 닫는다.
  const closedByUserBeforeShown = useRef(false);
  // 화면이 사라지는 중인지. 정리 단계에서 라이브러리가 onDismiss 를 불러도 사용자가 닫은 것으로 보지 않는다.
  const unmounted = useRef(false);
  // 내용 높이를 정수 dp 로 올려 고정하고, 1dp 안쪽의 변화는 무시한다. 그대로 두면 Android 에서 시트가 소수점 픽셀만큼
  // 움직일 때마다 내용 높이가 1px(0.4dp 안팎) 오르내리고, 라이브러리가 그때마다 목표 위치를 다시 잡아 애니메이션이 끝나지 않는다.
  const [contentHeight, setContentHeight] = useState<number>();
  // iOS 에서 키보드가 내려가기 시작하길 기다리는 중이면, 그 기다림을 취소하는 함수. 닫기를 여러 번 눌러도 한 번만 기다린다.
  const cancelPendingClose = useRef<(() => void) | null>(null);

  // 키보드가 열려 있으면 키보드와 시트가 같이 내려가게 한다.
  // 시트만 닫으면 시트가 먼저 내려가고, 키보드는 그 위에 남아 있다가 입력창이 사라진 뒤에야 늦게 내려간다.
  const requestClose = useCallback(() => {
    if (!Keyboard.isVisible()) {
      ref.current?.dismiss();
      return;
    }
    // Android 는 키보드가 내려가기 시작했다는 알림이 없다. 키보드를 내리라고 한 바로 뒤에 시트를 닫는다.
    if (Platform.OS !== "ios") {
      Keyboard.dismiss();
      ref.current?.dismiss();
      return;
    }
    // iOS 는 키보드가 실제로 움직이기 시작할 때(keyboardWillHide) 시트를 출발시켜 둘의 출발을 맞춘다.
    if (cancelPendingClose.current) return;
    const cancel = () => {
      sub.remove();
      clearTimeout(timer);
      cancelPendingClose.current = null;
    };
    const finish = () => {
      cancel();
      ref.current?.dismiss();
    };
    const sub = Keyboard.addListener("keyboardWillHide", finish);
    const timer = setTimeout(finish, KEYBOARD_HIDE_TIMEOUT);
    cancelPendingClose.current = cancel;
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (open) {
      if (!presented.current) {
        presented.current = true;
        ref.current?.present();
      } else if (closedByParent.current && !shown.current) {
        // 다 열리기 전에 미뤄 둔 닫기가 있었다. 다시 열렸으니 닫기를 버린다.
        closedByParent.current = false;
      } else if (closedByParent.current && cancelPendingClose.current) {
        // 키보드를 기다리느라 아직 시트를 닫기 전에 다시 열렸다. 닫기를 취소하고 그대로 둔다.
        cancelPendingClose.current();
        closedByParent.current = false;
      }
      // 이미 닫히는 중에 다시 열렸으면 닫힘이 끝난 뒤(onDismiss) 다시 연다.
    } else if (presented.current && !closedByParent.current) {
      closedByParent.current = true;
      // 아직 다 열리기 전이면 닫기를 미뤄 두고, 다 열리면(markShown) 닫는다.
      if (shown.current) requestClose();
    }
  }, [open, requestClose]);

  // 시트가 다 열렸다. 그 전에 화면이 닫으라고 했거나 사용자가 뒤로가기를 눌렀으면 이제 닫는다.
  const markShown = useCallback(() => {
    if (shown.current) return;
    shown.current = true;
    const byUser = closedByUserBeforeShown.current;
    closedByUserBeforeShown.current = false;
    if ((closedByParent.current && !openRef.current) || byUser) requestClose();
  }, [requestClose]);

  // 화면을 나갈 때 키보드를 기다리던 리스너와 타이머를 정리한다.
  useEffect(
    () => () => {
      unmounted.current = true;
      cancelPendingClose.current?.();
    },
    []
  );

  // Android 뒤로가기는 화면보다 떠 있는 시트를 먼저 닫는다. 가로채지 않으면 시트가 열린 채로 화면이 뒤로 넘어간다.
  // open 이 아니라 시트가 실제로 떠 있는지를 본다. 화면이 open 을 늦게 바꿔도 뒤로가기가 막히지 않게.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!presented.current) return false;
      // 열리는 중에는 아직 닫을 수 없어서, 다 열리면 닫도록 미뤄 둔다
      if (shown.current) requestClose();
      else closedByUserBeforeShown.current = true;
      return true;
    });
    return () => sub.remove();
  }, [requestClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        // 라이브러리가 바로 닫지 않게 제자리(0)로 두고, 키보드부터 내리는 requestClose 로 닫는다
        pressBehavior={0}
        onPress={requestClose}
        style={[props.style, { backgroundColor: colors.scrim }]}
      />
    ),
    [colors.scrim, requestClose]
  );

  // 라이브러리 기본 배경은 accessible · "Bottom Sheet" · adjustable 로 고정돼 있어 화면 읽기 프로그램이 빈 영역을 따로 읽는다.
  // 같은 모양의 단순한 View 로 직접 그린다.
  const renderBackground = useCallback(
    ({ pointerEvents, style }: BottomSheetBackgroundProps) => (
      <View
        pointerEvents={pointerEvents}
        style={[
          style,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
          },
        ]}
      />
    ),
    [colors.surface]
  );

  return (
    <BottomSheetModal
      ref={ref}
      // 라이브러리 기본값(true)이면 시트 전체가 "Bottom Sheet" 요소 하나로 묶여 제목 · 버튼 · 입력창을 화면 읽기 프로그램이 읽지 못한다.
      // 기본 이름("Bottom Sheet") · 역할(adjustable)도 null 로 지워, 묶이지 않은 빈 영역이 따로 읽히지 않게 한다.
      accessible={false}
      accessibilityLabel={null}
      accessibilityRole={null}
      // 다 열렸을 때 온다.
      onChange={(index) => {
        if (index >= 0) markShown();
      }}
      onDismiss={() => {
        presented.current = false;
        shown.current = false;
        closedByUserBeforeShown.current = false;
        const byParent = closedByParent.current;
        closedByParent.current = false;
        // 화면이 사라지면서 닫힌 것이다. 아무것도 알리지 않는다.
        if (unmounted.current) return;
        if (!byParent) {
          // 사용자가 닫았다. 화면이 open 을 false 로 바꾸게 알린다.
          if (openRef.current) onClose();
          return;
        }
        // 화면이 닫았는데 닫히는 동안 다시 열렸다. 그 요청대로 다시 연다.
        if (openRef.current) {
          presented.current = true;
          ref.current?.present();
        }
      }}
      animationConfigs={animationConfigs}
      // 기기의 "동작 줄이기"가 켜져 있어도 애니메이션으로 연다. 라이브러리가 애니메이션 없이 열려고 하면 시트가 아예 나타나지 않는다
      // (@gorhom/bottom-sheet 5.2 · 이슈 #1560). iOS 의 시트도 동작 줄이기와 상관없이 올라온다.
      overrideReduceMotion={ReduceMotion.Never}
      enablePanDownToClose
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundComponent={renderBackground}
      handleStyle={{ paddingTop: space[10], paddingBottom: 0 }}
      handleIndicatorStyle={{
        width: HANDLE.width,
        height: HANDLE.height,
        borderRadius: radius.full,
        backgroundColor: colors.line,
      }}
    >
      <BottomSheetView style={{ height: contentHeight }}>
        <View
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setContentHeight((prev) =>
              prev !== undefined && Math.abs(height - prev) < 1 ? prev : Math.ceil(height)
            );
          }}
          style={{
            paddingTop: space[16],
            paddingHorizontal: gutter,
            paddingBottom: Math.max(insets.bottom, space[24]),
            gap: space[16],
          }}
        >
          {title || closeLabel ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* 제목이 없으면 빈 제목을 화면 읽기 프로그램이 읽지 않게 자리만 채운다 */}
              {title ? (
                <Text variant="headingSm" accessibilityRole="header" style={{ flex: 1 }}>
                  {title}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              {closeLabel ? (
                <IconButton size={CLOSE_SIZE} label={closeLabel} onPress={requestClose}>
                  <CloseIcon size={CLOSE_ICON_SIZE} />
                </IconButton>
              ) : null}
            </View>
          ) : null}
          {children}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
