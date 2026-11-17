import { describe, expect, it } from "vitest";

import { imageSource, imageSources } from "./imageSource";

const BANDAI = "https://bandai-a.akamaihd.net/bc/img/model/b/1000227871_1.jpg";

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
});

describe("imageSources", () => {
  it("제공처를 겹치지 않게 모은다", () => {
    expect(imageSources([null, BANDAI, "https://placehold.co/a.png", BANDAI])).toEqual(["bandai"]);
  });

  it("출처를 표시할 이미지가 없으면 빈 배열", () => {
    expect(imageSources([])).toEqual([]);
    expect(imageSources([null, "https://placehold.co/a.png"])).toEqual([]);
  });
});
