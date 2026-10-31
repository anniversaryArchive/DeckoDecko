"use client";

import { useMutation } from "@tanstack/react-query";

import { useRepositories } from "./provider";
import { serverNetworkMode } from "./queryClient";
import type { SendFeedbackInput } from "../repositories/feedback";

/** 요청 · 문의를 보낼 수 있는지. 저장소를 넘기지 않은 빌드(출시 빌드, #185 전)에서는 false 라 화면이 진입점을 숨긴다. */
export function useCanSendFeedback(): boolean {
  return useRepositories().feedback !== undefined;
}

/**
 * 요청 · 문의 보내기. 기기 UUID 는 저장소가 붙인다.
 * 하루 제한에 걸리면 mutation.error 가 FeedbackLimitError 다. isFeedbackLimitError 로 가려 feedback.dailyLimit 문구를 띄운다.
 * 저장소가 없으면 렌더는 그대로 두고 보낼 때 실패한다. 진입점은 useCanSendFeedback 으로 숨긴다.
 * 오프라인이면 보내지 않고 멈춰 isPending 이 계속 true 다 (연결되면 이어서 보낸다). 화면은 오프라인 안내를 같이 띄운다.
 */
export function useSendFeedback() {
  const { feedback } = useRepositories();
  return useMutation({
    // 지금은 메모리 저장소지만 #185 뒤에는 서버로 보낸다
    ...serverNetworkMode,
    mutationFn: (input: SendFeedbackInput) => {
      if (!feedback) throw new Error("feedback 저장소를 넘기지 않아 요청 · 문의를 보낼 수 없다.");
      return feedback.sendFeedback(input);
    },
  });
}
