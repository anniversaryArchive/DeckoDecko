import i18n from "i18next";

/**
 * 날짜 · 가격 · 개수 포맷 헬퍼. 화면은 숫자에 단위를 직접 붙이지 않고 이 함수들을 쓴다.
 * 현재 언어(i18n.language)를 따른다. 언어가 바뀌면 useTranslation 을 쓰는 화면이 다시 그려지면서 새 언어로 나온다.
 */

/** 가격(엔). ko "1,000엔" · en "¥1,000" */
export function formatPrice(yen: number): string {
  return i18n.t("common.price", { value: yen });
}

/** 개수(종). ko "6종" · en "6 items" */
export function formatItemCount(count: number): string {
  return i18n.t("common.itemCount", { count });
}

/** 발매 월 "YYYY-MM". ko "2026년 10월" · en "Oct 2026". 형식이 다르면 받은 그대로 돌려준다. */
export function formatMonth(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return yearMonth;
  const month = Number(match[2]);
  // 1–12 밖이면 Date 가 다음 해로 넘겨 버리므로(2026-13 → 2027년 1월) 받은 그대로 돌려준다
  if (month < 1 || month > 12) return yearMonth;
  // 월만 쓰므로 시간대 영향을 받지 않게 UTC 로 만들고 UTC 로 표시한다
  const date = new Date(Date.UTC(Number(match[1]), month - 1, 1));
  return new Intl.DateTimeFormat(i18n.language, {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

/** 날짜. ko "2026. 10. 17." · en "Oct 17, 2026" */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(date);
}
