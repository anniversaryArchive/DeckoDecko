import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { isStoredPhoto, PHOTO_DIR, photoPath, resolvePhotoUri } from "./photoPaths";

/** 사본의 긴 변(px). 이보다 작은 사진은 키우지 않는다 */
const MAX_EDGE = 1024;
/** JPEG 압축 (1 이 원본 화질) */
const JPEG_QUALITY = 0.8;

/**
 * 고른 사진을 줄여서 앱 문서 폴더에 저장하고, items.thumbnail 에 넣을 상대 경로를 돌려준다.
 * 사진첩에서 원본을 지워도 사본은 남는다. 실패하면 던진다 (남은 파일은 정리한다).
 */
export async function savePhoto(sourceUri: string): Promise<string> {
  // 디코드한 비트맵은 네이티브 메모리라 JS GC 가 크기를 모르고 늦게 푼다. 다 쓰면 바로 놓는다
  const native: { release(): void }[] = [];
  const keep = <T extends { release(): void }>(object: T): T => {
    native.push(object);
    return object;
  };
  try {
    let image = keep(await keep(ImageManipulator.manipulate(sourceUri)).renderAsync());
    const { width, height } = image;
    if (Math.max(width, height) > MAX_EDGE) {
      const context = keep(ImageManipulator.manipulate(image));
      context.resize(width >= height ? { width: MAX_EDGE } : { height: MAX_EDGE });
      image = keep(await context.renderAsync());
    }
    // saveAsync 는 캐시 폴더에 쓴다. 캐시는 운영체제가 지울 수 있어 문서 폴더로 옮긴다
    const saved = new File(
      (await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY })).uri
    );

    const path = photoPath(randomUUID());
    try {
      new Directory(Paths.document, PHOTO_DIR).create({ intermediates: true, idempotent: true });
      await saved.move(new File(Paths.document, path));
    } catch (error) {
      if (saved.exists) saved.delete();
      throw error;
    }
    return path;
  } finally {
    for (const object of native) object.release();
  }
}

/** 앱이 저장한 사진 파일을 지운다. 그 밖의 주소 · 이미 없는 파일은 그냥 넘어간다. 실패해도 던지지 않는다. */
export function deletePhoto(thumbnail: string | null | undefined): void {
  if (!isStoredPhoto(thumbnail)) return;
  try {
    const file = new File(Paths.document, thumbnail);
    if (file.exists) file.delete();
  } catch (error) {
    // 파일이 남는 것뿐이라 기록 삭제 · 수정은 그대로 성공시킨다
    console.warn("deletePhoto failed", error);
  }
}

// Paths.document 는 읽을 때마다 네이티브 Directory 를 새로 만든다. 목록 카드마다 부르므로 주소만 한 번 읽어 둔다
const documentUri = Paths.document.uri;

/** Image 의 source 에 넘길 주소 */
export function photoUri(thumbnail: string): string {
  return resolvePhotoUri(thumbnail, documentUri);
}
