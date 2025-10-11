import "react-native-reanimated/src/initializers"; // TODO: 4.1.1 버전 출시 시 제거
import React, { useEffect } from "react";
import { Dimensions, View, Pressable, Keyboard } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedKeyboard,
} from "react-native-reanimated";

// 화면 높이 가져오기
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode; // 내부 콘텐츠
};

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // 바텀시트 수직 이동 위치 값 (translateY)
  const translateY = useSharedValue(SCREEN_HEIGHT);
  // 배경 오버레이 투명도 값
  const overlayOpacity = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();

  // open 상태 변화 감지
  useEffect(() => {
    if (open) {
      // 바텀시트 열기 : 화면 아래서 위로 스프링 애니메이션 추가
      translateY.value = withSpring(0, { damping: 30 });
      overlayOpacity.value = withTiming(0.3, { duration: 300 });
    } else {
      // 닫을 때 키보드 활성화 시, 비활성화 처리
      Keyboard.isVisible() && Keyboard.dismiss();
      // 바텀시트 닫기
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 30 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
      Keyboard.isVisible() && Keyboard.dismiss();
    }
  }, [open]);

  // 드래그 제스처 정의
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // 드래그 아래 방향일 때만 처리, 너무 크거나 음수값은 무시
      if (e.translationY > 0 && e.translationY < SCREEN_HEIGHT) {
        // 바텀시트 위치 실시간 업데이트
        translateY.value = e.translationY;

        // 드래그 거리에 따른 오버레이 투명도 변화
        overlayOpacity.value = withTiming(0.3 * (1 - e.translationY / (SCREEN_HEIGHT * 0.5)), {
          duration: 50,
        });
      }
    })
    .onEnd(() => {
      // 드래그 거리에 따라 바텀시트 닫기 또는 원위치 결정
      if (translateY.value > SCREEN_HEIGHT * 0.25) {
        // 일정 거리 이상 아래로 내리면 닫기 처리
        translateY.value = withSpring(SCREEN_HEIGHT, { damping: 30 });
        overlayOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)(); // 안전하게 JS 콜백 호출
      } else {
        // 짧게 드래그했으면 다시 원위치로
        translateY.value = withSpring(0, { damping: 30 });
        overlayOpacity.value = withTiming(0.3, { duration: 300 });
      }
    });

  // 배경 오버레이 애니메이션 스타일
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // 바텀시트 위치 애니메이션 스타일
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      // 키보드가 올라오면 그 높이만큼 하단에 패딩을 추가합니다.
      paddingBottom: keyboard.height.value,
    };
  });

  return (
    <>
      {/* 배경 오버레이 */}
      <Animated.View
        style={overlayStyle}
        className="absolute top-0 bottom-0 left-0 right-0 z-10 bg-black"
        pointerEvents={open ? "auto" : "none"}
      >
        <Pressable onPress={onClose} className="flex-1" />
      </Animated.View>

      {/* 제스처 핸들러로 감싼 바텀시트 */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[sheetStyle]}
          className="rounded-t-2xl absolute bottom-0 z-20 w-full bg-white"
        >
          {/* 헤더 영역: 가운데 그립 바 */}
          <View className="items-center justify-center w-full h-10">
            <Pressable onPress={onClose} hitSlop={10}>
              <View className="w-[60px] h-[3px] rounded-full bg-[#595959]" />
            </Pressable>
          </View>

          {/* 내부 콘텐츠 */}
          <Animated.View style={[{ paddingHorizontal: 16 }, animatedContentStyle]}>
            {children}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}
