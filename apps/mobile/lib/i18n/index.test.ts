import type { Locale } from "expo-localization";
import { describe, expect, it, vi } from "vitest";

const device = vi.hoisted(() => ({ languageCode: "ko" }));
vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: device.languageCode }],
}));

const locales = (languageCode: string) => [{ languageCode } as Locale];
const settle = () => new Promise((resolve) => setTimeout(resolve));

// 고른 언어가 모듈 변수(웹 · 테스트용 languagePreference.ts)에 남으므로 테스트마다 모듈을 새로 읽는다
async function load(deviceLanguage: string) {
  device.languageCode = deviceLanguage;
  vi.resetModules();
  return import("./index");
}

describe("언어 고르기", () => {
  it("고른 적이 없으면 기기 언어로 시작하고, 기기 언어가 바뀌면 따라간다", async () => {
    const { i18n, followDeviceLanguage } = await load("ko");
    expect(i18n.language).toBe("ko");

    followDeviceLanguage(locales("en"));
    await settle();
    expect(i18n.language).toBe("en");
  });

  it("고른 언어는 기기 언어가 바뀌어도 지킨다", async () => {
    const { i18n, chooseLanguage, followDeviceLanguage } = await load("ko");

    chooseLanguage("en");
    await settle();
    followDeviceLanguage(locales("ko"));
    await settle();
    expect(i18n.language).toBe("en");
  });

  it("지금 언어를 다시 고르면 languageChanged 가 오지 않고, 기기 언어를 계속 따른다", async () => {
    const { i18n, chooseLanguage, followDeviceLanguage } = await load("ko");
    const changed = vi.fn();
    i18n.on("languageChanged", changed);

    chooseLanguage("ko");
    await settle();
    expect(changed).not.toHaveBeenCalled();

    followDeviceLanguage(locales("en"));
    await settle();
    expect(i18n.language).toBe("en");
    i18n.off("languageChanged", changed);
  });
});
