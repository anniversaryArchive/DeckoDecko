import type { Feedback } from "../types";
import {
  cleanFeedbackInput,
  FEEDBACK_DAILY_LIMIT,
  feedbackDay,
  feedbackPhotoPath,
  FeedbackLimitError,
} from "./feedback";
import type { FeedbackRepository } from "./feedback";

type Options = {
  /** 앱은 lib/deviceId.ts 의 getDeviceId 를 넘긴다 */
  getDeviceId: () => Promise<string>;
  now?: () => Date; // 테스트에서 날짜를 넘길 때만
};

/**
 * 메모리 안에 쌓는 요청 · 문의 저장소. feedback 테이블이 생기기 전의 앱, 훅 테스트에 쓴다. 앱을 끄면 사라진다.
 * 사진은 올리지 않고 경로만 만든다. 하루 제한은 서버와 같은 기준(기기당, 한국 시간 하루 FEEDBACK_DAILY_LIMIT 건)으로 막는다.
 * snapshot 은 테스트에서 저장된 내용을 볼 때만 쓴다.
 */
export function createMemoryFeedbackRepository({
  getDeviceId,
  now = () => new Date(),
}: Options): FeedbackRepository & { snapshot(): Feedback[] } {
  let seq = 0;
  let photoSeq = 0;
  const rows: Feedback[] = [];

  return {
    async sendFeedback(input) {
      const fields = cleanFeedbackInput(input);
      const deviceId = await getDeviceId();
      const createdAt = now().toISOString();
      const today = feedbackDay(createdAt);
      const sentToday = rows.filter(
        (r) => r.deviceId === deviceId && feedbackDay(r.createdAt) === today
      ).length;
      if (sentToday >= FEEDBACK_DAILY_LIMIT) throw new FeedbackLimitError();

      const photoPath = input.photo
        ? feedbackPhotoPath(deviceId, `photo-${++photoSeq}`, input.photo.mimeType)
        : null;
      const id = `feedback-${++seq}`;
      rows.push({ id, ...fields, photoPath, deviceId, createdAt });
      return { id };
    },
    snapshot() {
      return rows.map((r) => ({ ...r }));
    },
  };
}
