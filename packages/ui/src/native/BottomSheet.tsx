import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BackHandler, Keyboard, Platform, Pressable, View } from "react-native";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../theme";
import { gutter, radius, space } from "../tokens";
import { CloseIcon } from "./icons";
import { Text } from "./Text";

/** 손잡이 막대 */
const HANDLE = { width: 40, height: 4 } as const;
/** 닫기 버튼 지름 */
const CLOSE_SIZE = 36;
/** 열고 닫는 데 걸리는 시간(ms) */
const DURATION = 450;
/** 키보드가 내려갔다는 알림이 오지 않을 때 시트를 닫기까지 기다리는 최대 시간(ms) */
const KEYBOARD_HIDE_TIMEOUT = 600;
/**
 * 키보드가 내려가는 시간 중 얼마가 지나면 시트를 출발시킬지 (0~1).
 * 다 내려갈 때까지 기다리면 시트가 늦게 움직여 답답하다. 키보드가 먼저 움직이기 시작한 것만 보이면 순서는 자연스럽다.
 */
const KEYBOARD_LEAD = 0.4;
/** iOS 는 키보드가 내려가기 시작할 때 알림이 온다 (내려가는 시간 duration 포함). Android 는 다 내려간 뒤에만 온다 */
const KEYBOARD_HIDE_EVENT = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

export type BottomSheetProps = {
  /** 열려 있는지. 화면의 상태로 연다 */
  open: boolean;
  /** 아래로 끌거나 뒤 배경을 누르거나 닫기를 눌렀을 때 */
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
  // 기기의 "동작 줄이기"가 켜져 있으면 라이브러리가 애니메이션 없이 바로 열고 닫는다. 접근성 설정을 따르려고 일부러 그대로 둔다.
  // 천천히 출발해 천천히 멈추는 곡선. 감속만 하는 곡선(cubic-out 등)은 처음 0.1초에 거의 다 움직여 "뿅" 하고 나타나 보인다.
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: DURATION,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  // 한 번도 열지 않은 시트에 dismiss() 를 부르면 그 뒤의 present() 가 무시된다 (@gorhom/bottom-sheet 5.2).
  // 그래서 열려 있을 때만 닫는다.
  const presented = useRef(false);
  // 내용 높이를 정수 dp 로 올려 고정하고, 1dp 안쪽의 변화는 무시한다. 그대로 두면 Android 에서 시트가 소수점 픽셀만큼
  // 움직일 때마다 내용 높이가 1px(0.4dp 안팎) 오르내리고, 라이브러리가 그때마다 목표 위치를 다시 잡아 애니메이션이 끝나지 않는다.
  const [contentHeight, setContentHeight] = useState<number>();
  // 키보드가 내려가길 기다리는 중인지. 닫기를 여러 번 눌러도 한 번만 기다린다.
  const closing = useRef(false);

  // 키보드가 열려 있으면 키보드를 먼저 내리고, 키보드가 움직이기 시작한 뒤에 시트를 닫는다.
  // 같이 닫으면 시트가 내려가는 동안 키보드가 그 위에 남아 있다가 늦게 내려간다.
  const requestClose = useCallback(() => {
    if (!Keyboard.isVisible()) {
      ref.current?.dismiss();
      return;
    }
    if (closing.current) return;
    closing.current = true;
    const finish = () => {
      sub.remove();
      clearTimeout(timer);
      closing.current = false;
      ref.current?.dismiss();
    };
    const sub = Keyboard.addListener(KEYBOARD_HIDE_EVENT, (e) => {
      clearTimeout(timer);
      timer = setTimeout(finish, (e?.duration ?? 0) * KEYBOARD_LEAD);
    });
    let timer = setTimeout(finish, KEYBOARD_HIDE_TIMEOUT);
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (open && !presented.current) {
      presented.current = true;
      ref.current?.present();
    } else if (!open && presented.current) {
      requestClose();
    }
  }, [open, requestClose]);

  // Android 뒤로가기는 화면보다 열린 시트를 먼저 닫는다. 가로채지 않으면 시트가 열린 채로 화면이 뒤로 넘어간다.
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      requestClose();
      return true;
    });
    return () => sub.remove();
  }, [open, requestClose]);

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

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={() => {
        presented.current = false;
        onClose();
      }}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.sheet,
        borderTopRightRadius: radius.sheet,
      }}
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
              <Text variant="headingSm" accessibilityRole="header" style={{ flex: 1 }}>
                {title ?? ""}
              </Text>
              {closeLabel ? <CloseButton label={closeLabel} onPress={requestClose} /> : null}
            </View>
          ) : null}
          {children}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function CloseButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={space[4]}
      style={({ pressed }) => ({
        width: CLOSE_SIZE,
        height: CLOSE_SIZE,
        borderRadius: radius.full,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <CloseIcon size={14} />
    </Pressable>
  );
}
