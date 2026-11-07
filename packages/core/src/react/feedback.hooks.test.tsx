// @vitest-environment happy-dom
import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import type { Repositories } from "../repositories";
import { useCanSendFeedback, useSendFeedback } from "./feedback.hooks";
import { CoreProvider } from "./provider";
import { FEEDBACK_DAILY_LIMIT, isFeedbackLimitError } from "../repositories/feedback";
import { createMemoryFeedbackRepository } from "../repositories/feedback.memory";
import { createMemoryGachaRepository } from "../repositories/gacha.memory";

afterEach(cleanup);

function setup(withFeedback = true) {
  const feedback = createMemoryFeedbackRepository({ getDeviceId: async () => "device-a" });
  const repositories: Repositories = {
    gacha: createMemoryGachaRepository([]),
    ...(withFeedback && { feedback }),
  };
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider repositories={repositories} queryClient={queryClient}>
      {children}
    </CoreProvider>
  );
  return { wrapper, feedback };
}

describe("useSendFeedback", () => {
  it("기기 UUID 를 붙여 저장하고, 새 id 를 돌려준다", async () => {
    const { wrapper, feedback } = setup();
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    let saved: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined;
    await act(async () => {
      saved = await result.current.mutateAsync({ kind: "bug", content: "꺼져요" });
    });
    const [row] = feedback.snapshot();
    expect(saved).toEqual({ id: row!.id });
    expect(row).toMatchObject({ kind: "bug", content: "꺼져요", deviceId: "device-a" });
  });

  it("하루 제한에 걸리면 error 가 FeedbackLimitError 다", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    await act(async () => {
      for (let i = 0; i < FEEDBACK_DAILY_LIMIT; i++) {
        await result.current.mutateAsync({ kind: "bug", content: `${i}` });
      }
    });
    act(() => result.current.mutate({ kind: "bug", content: "한 번 더" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(isFeedbackLimitError(result.current.error)).toBe(true);
  });

  it("저장소를 넘기지 않으면 렌더는 되고, 보낼 때 실패한다", async () => {
    const { wrapper } = setup(false);
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    act(() => result.current.mutate({ kind: "bug", content: "꺼져요" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/feedback 저장소/);
  });
});

describe("useCanSendFeedback", () => {
  it("저장소가 있을 때만 true", () => {
    const yes = renderHook(() => useCanSendFeedback(), { wrapper: setup().wrapper });
    expect(yes.result.current).toBe(true);
    const no = renderHook(() => useCanSendFeedback(), { wrapper: setup(false).wrapper });
    expect(no.result.current).toBe(false);
  });
});
