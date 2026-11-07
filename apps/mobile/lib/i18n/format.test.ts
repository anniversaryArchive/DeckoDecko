import i18n from "i18next";
import { beforeAll, describe, expect, it } from "vitest";

import { en } from "./en";
import { formatNumber, formatPercent, formatShortDate } from "./format";
import { ko } from "./ko";

// 앱의 index.ts 는 expo-localization 을 불러서 Node 에서 읽히지 않는다. 같은 리소스로 따로 초기화한다.
beforeAll(async () => {
  await i18n.init({
    resources: { ko: { translation: ko }, en: { translation: en } },
    lng: "ko",
    interpolation: { escapeValue: false },
  });
});

describe.each(["ko", "en"] as const)("포맷 헬퍼 (%s)", (lng) => {
  beforeAll(async () => {
    await i18n.changeLanguage(lng);
  });

  it("formatNumber: 천 단위 구분 기호를 넣는다", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(7)).toBe("7");
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formatPercent: 0 · 중간 · 100", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(58)).toBe("58%");
    expect(formatPercent(100)).toBe("100%");
  });
});

describe("formatShortDate", () => {
  it("기기 시간대의 날짜를 월 · 일 두 자리로 (ko 2026.01.05 · en 01/05/2026)", async () => {
    await i18n.changeLanguage("ko");
    expect(formatShortDate(new Date(2026, 0, 5, 23, 59))).toBe("2026.01.05");
    await i18n.changeLanguage("en");
    expect(formatShortDate(new Date(2026, 9, 29))).toBe("10/29/2026");
  });
});
