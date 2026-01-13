import React, { useEffect } from "react";
import { Dimensions, View, Pressable, Keyboard, StyleSheet, Platform } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  runOnUI,
} from "react-native-reanimated";
import { Portal } from "@/PortalContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  const paddingBottom = useSharedValue(0);

  // 키보드가 나타나기 시작할 때부터 애니메이션 시작
  useEffect(() => {
    const updatePaddingBottom = (height: number, duration: number) => {
      "worklet";
      paddingBottom.value = withTiming(height, { duration });
    };

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        const duration = Platform.OS === "ios" ? (e.duration || 250) * 1000 : 250;
        runOnUI(updatePaddingBottom)(e.endCoordinates.height, duration);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        const duration = Platform.OS === "ios" ? (e.duration || 250) * 1000 : 250;
        runOnUI(updatePaddingBottom)(0, duration);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [paddingBottom]);

  useEffect(() => {
    if (open) {
      // 바텀시트 열기
      translateY.value = withSpring(0);
      overlayOpacity.value = withTiming(0.3, { duration: 300 });
    } else {
      // 바텀시트 닫기
      Keyboard.isVisible() && Keyboard.dismiss();
      overlayOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 30 });
    }
  }, [open, translateY, overlayOpacity]); // 의존성 단순화

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
        runOnJS(onClose)(); // 닫기 실행
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
