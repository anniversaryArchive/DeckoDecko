import React, { useEffect } from "react";
import {
  Dimensions,
  View,
  Pressable,
  Keyboard,
  StyleSheet,
  Platform,
  KeyboardEventName,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Portal } from "@/PortalContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  isTopSheet?: boolean; // 스택의 최상단 시트인지 여부
};

// duration이 있으면 초 단위 값이므로 밀리초로 변환, 없으면 기본값 250ms
const convertDuration = (duration?: number | null) => {
  return duration ? duration * 1000 : 250;
};

// 플랫폼별 키보드 이벤트 이름
const [keyboardShowEvent, keyboardHideEvent]: KeyboardEventName[] =
  Platform.OS === "ios"
    ? ["keyboardWillShow", "keyboardWillHide"]
    : ["keyboardDidShow", "keyboardDidHide"];

export default function BottomSheet({
  open,
  onClose,
  children,
  isTopSheet = true,
}: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  const paddingBottom = useSharedValue(0);
  const sheetOpacity = useSharedValue(1);

  // 키보드가 나타나기 시작할 때부터 애니메이션 시작
  useEffect(() => {
    const updatePaddingBottom = (height: number, duration: number) => {
      "worklet"; // worklet 함수를 직접 호출하면 자동으로 UI 스레드에서 실행됨
      paddingBottom.value = withTiming(height, { duration });
    };

    const keyboardWillShowListener = Keyboard.addListener(keyboardShowEvent, (e) =>
      updatePaddingBottom(e.endCoordinates.height, convertDuration(e.duration))
    );
    const keyboardWillHideListener = Keyboard.addListener(keyboardHideEvent, (e) =>
      updatePaddingBottom(0, convertDuration(e.duration))
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [paddingBottom]);

  useEffect(() => {
    if (open) {
      // 바텀시트 열기
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      if (isTopSheet) {
        overlayOpacity.value = withTiming(0.3, { duration: 300 });
        sheetOpacity.value = withTiming(1, { duration: 300 });
      } else {
        overlayOpacity.value = 0;
        sheetOpacity.value = withTiming(0, { duration: 300 });
      }
    } else {
      // 바텀시트 닫기
      Keyboard.isVisible() && Keyboard.dismiss();
      overlayOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 30 });
      sheetOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [open, translateY, overlayOpacity, isTopSheet, sheetOpacity]);

  // 드래그 제스처 (기존과 동일)
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0 && e.translationY < SCREEN_HEIGHT) {
        translateY.value = e.translationY;
        overlayOpacity.value = withTiming(0.3 * (1 - e.translationY / (SCREEN_HEIGHT * 0.5)), {
          duration: 50,
        });
      }
    })
    .onEnd(() => {
      if (translateY.value > SCREEN_HEIGHT * 0.25) {
        onClose();
      } else {
        translateY.value = withSpring(0, { damping: 30 });
        overlayOpacity.value = withTiming(0.3, { duration: 300 });
      }
    });

  // 스타일 (기존과 동일)
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: sheetOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    paddingBottom: paddingBottom.value,
  }));

  // 3. 닫혀있고 애니메이션도 끝난 상태면 렌더링하지 않음
  // (애니메이션 도중에는 렌더링을 유지해야 함)
  if (!open && translateY.value === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill} pointerEvents={open ? "auto" : "none"}>
        {/* 배경 오버레이 */}
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]} className="bg-black">
          <Pressable onPress={onClose} className="flex-1" />
        </Animated.View>

        {/* 제스처 핸들러로 감싼 바텀시트 */}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={sheetStyle}
            className={"absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-2xl"}
          >
            {/* 헤더 영역: 가운데 그립 바 */}
            <View className="items-center justify-center w-full h-10">
              <Pressable onPress={onClose} hitSlop={10}>
                <View className="w-[60px] h-[3px] rounded-full bg-[#595959]" />
              </Pressable>
            </View>

            {/* 내부 콘텐츠 */}
            <Animated.View style={animatedContentStyle} className={"px-4"}>
              {children}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Portal>
  );
}
