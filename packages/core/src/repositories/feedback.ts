import type { Feedback, FeedbackKind } from "../types";

/** 기기당 하루(한국 시간 자정 기준) 보낼 수 있는 요청 · 문의 수. 서버 RPC 의 제한과 같은 값으로 둔다. */
export const FEEDBACK_DAILY_LIMIT = 5;

/**
 * 칸별 최대 글자 수 (앞뒤 공백을 지운 뒤, 서버처럼 코드 포인트로 센다). feedback 테이블의 길이 제약과 같은 값이다.
 * 화면은 이 값으로 TextInput 의 maxLength 를 건다. 넘기면 sendFeedback 이 던진다.
 */
export const FEEDBACK_MAX_LENGTH = {
  gachaName: 100,
  mediaText: 100,
  content: 2000,
} as const;

/** 이미지 피커가 돌려준 사진. uri 는 기기 안의 파일 (file://) */
export type FeedbackPhoto = {
  uri: string;
  mimeType?: string | null; // 모르면 비워 둔다 (jpg 로 본다). 피커 결과를 그대로 넘기면 된다
};

/** 작품 칸. 자동완성에서 고르면 id, 목록에 없어 직접 적으면 text. 둘을 같이 넘기면 타입 오류다 */
export type FeedbackMediaInput = { id: string; text?: never } | { text: string; id?: never };

type CommonInput = {
  photo?: FeedbackPhoto | null;
};

/** 보낼 내용. 기기 UUID 는 저장소가 붙이므로 화면이 넘기지 않는다. */
export type SendFeedbackInput =
  | (CommonInput & {
      kind: Extract<FeedbackKind, "request">;
      gachaName: string; // 필수
      media?: FeedbackMediaInput | null;
      content?: string; // "자세히", 선택
    })
  | (CommonInput & {
      kind: Exclude<FeedbackKind, "request">;
      content: string; // 필수
    });

/** 하루 건수 제한에 걸렸을 때 sendFeedback 이 던진다. 화면은 isFeedbackLimitError 로 가려 안내 문구를 띄운다. */
export class FeedbackLimitError extends Error {
  readonly limit: number;

  constructor(limit: number = FEEDBACK_DAILY_LIMIT) {
    super(`feedback daily limit reached (${limit})`);
    this.name = "FeedbackLimitError";
    this.limit = limit;
  }
}

// 패키지가 두 벌 번들되면 instanceof 가 어긋나므로 name 으로도 본다
export function isFeedbackLimitError(error: unknown): error is FeedbackLimitError {
  return (
    error instanceof FeedbackLimitError ||
    (error instanceof Error && error.name === "FeedbackLimitError")
  );
}

/**
 * 요청 · 문의 보내기. 화면은 useSendFeedback 훅만 쓴다.
 *   createMemoryFeedbackRepository: feedback 테이블(#185) 전, 개발 빌드에서만
 *   Supabase 구현(#185 뒤): 사진을 클라이언트 UUID 경로로 먼저 올리고 → submit_feedback RPC(하루 건수 확인 + 저장).
 *     RPC 가 PT429 로 거절하면 FeedbackLimitError 로 바꿔 던지고, 먼저 올린 사진은 지운다
 */
export interface FeedbackRepository {
  /**
   * 사진이 있으면 올리고 그 경로와 함께 저장한다. 하루 제한을 넘으면 저장하지 않고 FeedbackLimitError 를 던진다.
   * 필수 칸이 비어 있거나 FEEDBACK_MAX_LENGTH 를 넘으면 던진다 (화면이 먼저 막는다).
   * 서버(submit_feedback)가 새 id 만 돌려주므로 저장한 내용은 돌려주지 않는다.
   */
  sendFeedback(input: SendFeedbackInput): Promise<{ id: string }>;
}

function checkLength(field: keyof typeof FEEDBACK_MAX_LENGTH, value: string | null) {
  const max = FEEDBACK_MAX_LENGTH[field];
  if (value && [...value].length > max)
    throw new Error(`${field} must be at most ${max} characters`);
}

/** 저장할 칸으로 정리한다. 앞뒤 공백을 지우고, 빈 선택 칸은 null. 필수 칸 · 길이를 검사한다. 구현들이 같이 쓴다. */
export function cleanFeedbackInput(
  input: SendFeedbackInput
): Pick<Feedback, "kind" | "gachaName" | "mediaId" | "mediaText" | "content"> {
  const content = input.content?.trim() || null;
  checkLength("content", content);
  if (input.kind === "request") {
    const gachaName = input.gachaName.trim();
    if (!gachaName) throw new Error("gachaName must not be empty");
    checkLength("gachaName", gachaName);
    const media = input.media;
    const mediaId = media?.id?.trim() || null;
    const mediaText = mediaId ? null : media?.text?.trim() || null;
    checkLength("mediaText", mediaText);
    return { kind: input.kind, gachaName, mediaId, mediaText, content };
  }
  if (!content) throw new Error("content must not be empty");
  return { kind: input.kind, gachaName: null, mediaId: null, mediaText: null, content };
}

const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/webp": "webp",
};

/**
 * Storage 안의 사진 경로 `<기기 UUID>/<사진 id>.<확장자>`. feedback id 는 저장한 뒤에야 생기므로 사진 id 는 클라이언트가 만든다 (UUID).
 * 기기 UUID 는 위조할 수 있으니 이 폴더를 권한 경계로 쓰지 않는다.
 */
export function feedbackPhotoPath(deviceId: string, photoId: string, mimeType?: string | null) {
  const ext = (mimeType ? PHOTO_EXTENSIONS[mimeType.toLowerCase()] : undefined) ?? "jpg";
  return `${deviceId}/${photoId}.${ext}`;
}

/** 하루 제한을 세는 날짜 (한국 시간 YYYY-MM-DD). 서버도 Asia/Seoul 날짜로 센다. */
export function feedbackDay(iso: string): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // 한국은 서머타임이 없다
  return new Date(Date.parse(iso) + KST_OFFSET_MS).toISOString().slice(0, 10);
}
