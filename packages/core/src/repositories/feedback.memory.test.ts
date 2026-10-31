import { describe, expect, it } from "vitest";

import {
  FEEDBACK_DAILY_LIMIT,
  feedbackDay,
  feedbackPhotoPath,
  isFeedbackLimitError,
  type SendFeedbackInput,
} from "./feedback";
import { createMemoryFeedbackRepository } from "./feedback.memory";

function setup(start = "2026-10-28T03:00:00.000Z", deviceId = "device-a") {
  let now = new Date(start);
  const repo = createMemoryFeedbackRepository({
    getDeviceId: async () => deviceId,
    now: () => now,
  });
  return {
    repo,
    setNow: (iso: string) => {
      now = new Date(iso);
    },
  };
}

const bug: SendFeedbackInput = { kind: "bug", content: "앱이 꺼져요" };

async function sendTimes(repo: ReturnType<typeof setup>["repo"], n: number) {
  for (let i = 0; i < n; i++) await repo.sendFeedback(bug);
}

describe("createMemoryFeedbackRepository", () => {
  it("기기 UUID 와 시각을 붙여 저장하고, 공백을 정리한다", async () => {
    const { repo } = setup();
    const saved = await repo.sendFeedback({ kind: "idea", content: "  다크 모드 \n" });
    expect(saved).toMatchObject({
      kind: "idea",
      content: "다크 모드",
      gachaName: null,
      mediaId: null,
      mediaText: null,
      photoPath: null,
      deviceId: "device-a",
      createdAt: "2026-10-28T03:00:00.000Z",
    });
    expect(saved.id).toBeTruthy();
  });

  it("가챠 등록 요청: 고른 작품은 mediaId, 직접 적은 작품은 mediaText 로 저장한다", async () => {
    const { repo } = setup();
    const picked = await repo.sendFeedback({
      kind: "request",
      gachaName: " 별의 숲 미니 피규어 ",
      media: { id: "m-starry-forest" },
    });
    expect(picked).toMatchObject({
      gachaName: "별의 숲 미니 피규어",
      mediaId: "m-starry-forest",
      mediaText: null,
      content: null, // 비운 "자세히"
    });

    const typed = await repo.sendFeedback({
      kind: "request",
      gachaName: "새 가챠",
      media: { text: " 없는 작품 " },
      content: "3월 발매",
    });
    expect(typed).toMatchObject({ mediaId: null, mediaText: "없는 작품", content: "3월 발매" });

    // 타입은 막지만, 런타임에 둘 다 오면 고른 작품을 쓴다
    const both = await repo.sendFeedback({
      kind: "request",
      gachaName: "새 가챠",
      media: { id: "m-1", text: "적은 글자" } as unknown as { id: string },
    });
    expect(both).toMatchObject({ mediaId: "m-1", mediaText: null });

    const blankId = await repo.sendFeedback({
      kind: "request",
      gachaName: "새 가챠",
      media: { id: "  " },
    });
    expect(blankId).toMatchObject({ mediaId: null, mediaText: null });

    const blank = await repo.sendFeedback({
      kind: "request",
      gachaName: "새 가챠",
      media: { text: "   " },
    });
    expect(blank.mediaText).toBeNull();
  });

  it("필수 칸이 비어 있으면 던진다", async () => {
    const { repo } = setup();
    await expect(repo.sendFeedback({ kind: "request", gachaName: "  " })).rejects.toThrow();
    await expect(repo.sendFeedback({ kind: "bug", content: " " })).rejects.toThrow();
  });

  it("사진이 있으면 기기 UUID 폴더 아래 경로를 붙인다", async () => {
    const { repo } = setup();
    const saved = await repo.sendFeedback({
      ...bug,
      photo: { uri: "file:///tmp/a.png", mimeType: "image/png" },
    });
    expect(saved.photoPath).toBe(`device-a/${saved.id}.png`);
  });

  it(`하루 ${FEEDBACK_DAILY_LIMIT}건을 넘으면 FeedbackLimitError, 한국 시간으로 다음 날이 되면 다시 보낼 수 있다`, async () => {
    // 2026-10-28 23:59 KST
    const { repo, setNow } = setup("2026-10-28T14:59:00.000Z");
    await sendTimes(repo, FEEDBACK_DAILY_LIMIT);

    const error = await repo.sendFeedback(bug).catch((e: unknown) => e);
    expect(isFeedbackLimitError(error)).toBe(true);

    // 2026-10-29 00:00 KST (UTC 로는 아직 28일)
    setNow("2026-10-28T15:00:00.000Z");
    await expect(repo.sendFeedback(bug)).resolves.toBeTruthy();
  });

  it("제한은 기기마다 따로 센다", async () => {
    const getDeviceId = { current: "device-a" };
    const repo = createMemoryFeedbackRepository({
      getDeviceId: async () => getDeviceId.current,
      now: () => new Date("2026-10-28T03:00:00.000Z"),
    });
    await sendTimes(repo, FEEDBACK_DAILY_LIMIT);
    getDeviceId.current = "device-b";
    await expect(repo.sendFeedback(bug)).resolves.toMatchObject({ deviceId: "device-b" });
  });
});

describe("feedback 도우미", () => {
  it("isFeedbackLimitError 는 다른 번들의 같은 에러도 이름으로 알아본다", () => {
    const foreign = Object.assign(new Error("limit"), { name: "FeedbackLimitError" });
    expect(isFeedbackLimitError(foreign)).toBe(true);
    expect(isFeedbackLimitError(new Error("other"))).toBe(false);
  });

  it("작품 칸에 id 와 text 를 같이 넣으면 타입 오류다", () => {
    const input: SendFeedbackInput = {
      kind: "request",
      gachaName: "g",
      // @ts-expect-error 고른 작품(id)과 적은 글자(text) 중 하나만
      media: { id: "1", text: "t" },
    };
    expect(input.kind).toBe("request");
  });

  it("feedbackDay 는 한국 시간 날짜", () => {
    expect(feedbackDay("2026-10-28T14:59:59.999Z")).toBe("2026-10-28");
    expect(feedbackDay("2026-10-28T15:00:00.000Z")).toBe("2026-10-29");
  });

  it("feedbackPhotoPath 는 모르는 형식 · null 이면 jpg", () => {
    expect(feedbackPhotoPath("d", "f", "image/JPEG")).toBe("d/f.jpg");
    expect(feedbackPhotoPath("d", "f", "image/heic")).toBe("d/f.heic");
    expect(feedbackPhotoPath("d", "f", null)).toBe("d/f.jpg");
    expect(feedbackPhotoPath("d", "f", "application/octet-stream")).toBe("d/f.jpg");
    expect(feedbackPhotoPath("d", "f", "")).toBe("d/f.jpg");
    expect(feedbackPhotoPath("d", "f")).toBe("d/f.jpg");
  });
});
