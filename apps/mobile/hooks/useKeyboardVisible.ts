import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/** 소프트 키보드가 떠 있는지. Android 에서 키보드 위로 따라 올라오는 하단 UI 를 숨길 때 쓴다. */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}
