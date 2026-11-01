import { describe, expect, it } from "vitest";

import { isStoredPhoto, photoPath, resolvePhotoUri } from "./photoPaths";

const DOCUMENT = "file:///var/mobile/Containers/Data/Application/ABC/Documents/";

describe("photoPath", () => {
  it("문서 폴더 기준 상대 경로를 만든다", () => {
    expect(photoPath("1234")).toBe("photos/1234.jpg");
  });

  it("만든 경로는 저장한 사진으로 본다", () => {
    expect(isStoredPhoto(photoPath("1234"))).toBe(true);
  });
});

describe("isStoredPhoto", () => {
  it.each([
    ["사진 선택기 임시 주소", "file:///var/mobile/tmp/ImagePicker/abc.jpg"],
    ["Android content 주소", "content://media/picker/0/1"],
    ["photos 로 시작하지만 하위 폴더가 아님", "photosX/1.jpg"],
    ["폴더 밖을 가리키는 경로", "photos/../db.sqlite"],
    ["빈 문자열", ""],
    ["null", null],
  ])("%s 는 아니다", (_, value) => {
    expect(isStoredPhoto(value)).toBe(false);
  });
});

describe("resolvePhotoUri", () => {
  it("저장한 사진은 문서 폴더 주소를 앞에 붙인다", () => {
    expect(resolvePhotoUri("photos/1.jpg", DOCUMENT)).toBe(`${DOCUMENT}photos/1.jpg`);
  });

  it("문서 폴더 주소 끝에 / 가 없어도 같다", () => {
    expect(resolvePhotoUri("photos/1.jpg", DOCUMENT.slice(0, -1))).toBe(`${DOCUMENT}photos/1.jpg`);
  });

  it("그 밖의 주소는 그대로 둔다", () => {
    const picked = "file:///var/mobile/tmp/ImagePicker/abc.jpg";
    expect(resolvePhotoUri(picked, DOCUMENT)).toBe(picked);
  });
});
