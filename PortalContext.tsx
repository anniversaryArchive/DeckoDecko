import {
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
  ReactNode,
  FC,
  useEffect,
} from "react";
import { View, StyleSheet } from "react-native";

// 1. Context가 제공할 값의 타입을 정의합니다.
type PortalContextType = {
  addPortal: (portal: ReactNode) => void;
  removePortal: (portal: ReactNode) => void;
  portals: ReactNode[]; // 렌더링할 포탈(바텀시트) 목록
};

// 2. Context 생성 (초기값 null)
const PortalContext = createContext<PortalContextType | null>(null);

// 3. Context를 쉽게 사용하기 위한 Custom Hook
export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
};

// 4. Portal을 렌더링할 호스트 (Provider 내부에서만 사용)
const PortalHost: FC = () => {
  const { portals } = usePortal(); // Context로부터 렌더링할 목록을 가져옴

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* absoluteFill: 화면 전체를 덮음 (헤더 위 포함)
        pointerEvents="box-none": 자식 View(바텀시트)만 터치 이벤트를 받도록 함
      */}
      {portals.map((portal, index) => (
        <View key={index} style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {portal}
        </View>
      ))}
    </View>
  );
};

// 5. 앱 전체를 감쌀 Provider
type PortalProviderProps = {
  children: ReactNode;
};

export const PortalProvider: FC<PortalProviderProps> = ({ children }) => {
  const [portals, setPortals] = useState<ReactNode[]>([]);

  // 포탈 추가
  const addPortal = useCallback((portal: ReactNode) => {
    setPortals((prev) => [...prev, portal]);
  }, []);

  // 포탈 제거
  const removePortal = useCallback((portal: ReactNode) => {
    setPortals((prev) => prev.filter((p) => p !== portal));
  }, []);

  // Context 값 memoization
  const value = useMemo<PortalContextType>(
    () => ({
      addPortal,
      removePortal,
      portals,
    }),
    [addPortal, removePortal, portals]
  );

  return (
    <PortalContext.Provider value={value}>
      {children}
      {/* PortalHost가 앱 최상단에 렌더링됨 */}
      <PortalHost />
    </PortalContext.Provider>
  );
};

// 6. 바텀시트를 '텔레포트'시킬 Portal 컴포넌트
type PortalProps = {
  children: ReactNode;
};

export const Portal: FC<PortalProps> = ({ children }) => {
  const { addPortal, removePortal } = usePortal();

  useEffect(() => {
    // 마운트될 때 자신(children)을 Provider에게 등록
    addPortal(children);
    // 언마운트될 때 Provider에서 제거
    return () => removePortal(children);
  }, [addPortal, removePortal, children]);

  // 자신은 아무것도 렌더링하지 않음
  return null;
};
