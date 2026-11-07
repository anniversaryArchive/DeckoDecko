import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from "expo-network";
import { AppState } from "react-native";

import { setOnlineListener } from "@deckodecko/core/react";

/** 연결이 없거나 인터넷에 닿지 않으면 오프라인. 아직 모르는 값(undefined · null)은 온라인으로 본다. */
export function isOnline(state: Pick<NetworkState, "isConnected" | "isInternetReachable">) {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

// 지금 걸려 있는 리스너의 setOnline. recheckNetworkState 가 쓴다.
let reportOnline: ((online: boolean) => void) | undefined;

/** expo-network 의 기기 네트워크 상태를 React Query 의 온라인 상태로 넘긴다. 루트 레이아웃이 한 번 부른다. */
export function watchNetworkState(): void {
  setOnlineListener((setOnline) => {
    let changed = false;
    const report = (online: boolean) => {
      changed = true;
      setOnline(online);
    };
    reportOnline = report;
    const subscription = addNetworkStateListener((state) => report(isOnline(state)));
    // 백그라운드에서 얼어 있는 동안(Android 14+) 바뀐 연결은 이벤트가 빠질 수 있어 다시 열릴 때 맞춘다
    const appState = AppState.addEventListener("change", (next) => {
      if (next === "active") recheckNetworkState();
    });
    // Android 는 바뀔 때까지 첫 값을 보내지 않아서 직접 묻는다. 그 사이 이벤트가 왔으면 늦게 온 이 값은 버린다.
    getNetworkStateAsync()
      .then((state) => {
        if (!changed) setOnline(isOnline(state));
      })
      .catch(() => {});
    return () => {
      // 정리한 뒤에 도착한 첫 값이 다음 리스너의 상태를 덮어쓰지 않게 막는다
      changed = true;
      if (reportOnline === report) reportOnline = undefined;
      subscription.remove();
      appState.remove();
    };
  });
}

/**
 * 기기에 연결 상태를 다시 물어 React Query 에 알린다. 오프라인 안내의 "다시 시도"와 앱이 다시 열릴 때 쓴다.
 * 멈춘 쿼리는 refetch 해도 오프라인이면 다시 멈추므로, 상태를 바로잡아 온라인이면 React Query 가 이어서 불러오게 한다.
 */
export function recheckNetworkState(): void {
  getNetworkStateAsync()
    .then((state) => reportOnline?.(isOnline(state)))
    .catch(() => {});
}
