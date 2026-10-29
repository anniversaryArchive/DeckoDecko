"use client";

import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

/**
 * 기기의 네트워크 상태를 React Query 에 알리는 리스너를 단다. 앱 시작 때 한 번 부른다.
 * setup 은 상태가 바뀔 때마다 setOnline 을 부르고, 구독 해제 함수를 돌려준다.
 * 오프라인이면 서버 쿼리는 요청을 보내지 않고 멈춰(isPaused) 있다가, 다시 연결되면 React Query 가 이어서 불러온다.
 * 부르지 않으면 RN 에서는 늘 온라인으로 본다 (기본 리스너는 웹의 window online · offline 이벤트만 듣는다).
 */
export function setOnlineListener(
  setup: (setOnline: (online: boolean) => void) => (() => void) | undefined
): void {
  onlineManager.setEventListener(setup);
}

// useSyncExternalStore 는 subscribe 가 바뀌면 구독을 다시 걸어서 렌더 밖에서 한 번만 만든다
const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange);
const getSnapshot = () => onlineManager.isOnline();
const getServerSnapshot = () => true;

/** 지금 온라인인지. 오프라인 배너처럼 화면 전체의 연결 상태를 보일 때 쓴다. */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
