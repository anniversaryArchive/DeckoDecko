import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { imageSource, imageSources } from "./imageSource";

const BANDAI = "https://bandai-a.akamaihd.net/bc/img/model/b/1000227871_1.jpg";

beforeEach(() => {
  vi.stubGlobal("__DEV__", false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("imageSource", () => {
  it("반다이 CDN 이미지는 bandai", () => {
    expect(imageSource(BANDAI)).toBe("bandai");
    expect(imageSource("HTTPS://Bandai-A.akamaihd.net:443/x.png")).toBe("bandai");
  });

  it("모르는 호스트 · 로컬 파일 · 빈 값은 null", () => {
    expect(imageSource("https://placehold.co/400x400?text=G01")).toBeNull();
    expect(imageSource("https://evil.example/bandai-a.akamaihd.net/x.png")).toBeNull();
    expect(imageSource("file:///data/photos/a.jpg")).toBeNull();
    expect(imageSource("")).toBeNull();
    expect(imageSource(null)).toBeNull();
    expect(imageSource(undefined)).toBeNull();
  });

  it("사용자 정보(@) 앞에 반다이 호스트를 적은 주소는 반다이가 아니다", () => {
    expect(imageSource("https://bandai-a.akamaihd.net@evil.example/x.png")).toBeNull();
  });

  // 카탈로그는 https 로 시작하는 주소만 넣는다. 다른 모양은 앱도 이미지로 못 열 수 있어 출처를 붙이지 않는다
  it("프로토콜 생략 · 앞쪽 공백이 있는 주소는 null", () => {
    expect(imageSource("//bandai-a.akamaihd.net/x.png")).toBeNull();
    expect(imageSource("  https://bandai-a.akamaihd.net/x.png")).toBeNull();
  });
});

describe("imageSources", () => {
  it("여러 목록의 제공처를 겹치지 않게 모은다", () => {
    expect(
      imageSources([
        [null, { imageUrl: BANDAI }, { imageUrl: "https://placehold.co/a.png" }],
        undefined,
        [{ imageUrl: BANDAI }, undefined],
      ])
    ).toEqual(["bandai"]);
  });

  it("출처를 표시할 이미지가 없으면 빈 배열", () => {
    expect(imageSources([])).toEqual([]);
    expect(
      imageSources([[{ imageUrl: null }, { imageUrl: "https://placehold.co/a.png" }]])
    ).toEqual([]);
  });
});

describe("모르는 호스트 경고", () => {
  it("개발 빌드에서 표에 없는 https 호스트를 호스트마다 한 번 알린다", () => {
    vi.stubGlobal("__DEV__", true);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    imageSource("https://cdn.unknown-a.example/1.png");
    imageSource("https://cdn.unknown-a.example/2.png");
    imageSource("https://cdn.unknown-b.example/1.png");
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain("cdn.unknown-a.example");
  });

  it("자리 표시 이미지 · http · 반다이 · 출시 빌드는 알리지 않는다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("__DEV__", true);
    imageSource("https://placehold.co/a.png");
    imageSource("http://cdn.unknown-c.example/a.png");
    imageSource(BANDAI);
    vi.stubGlobal("__DEV__", false);
    imageSource("https://cdn.unknown-d.example/a.png");
    expect(warn).not.toHaveBeenCalled();
  });
});
