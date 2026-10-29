/** 아이템 사진을 두는 앱 문서 폴더 안의 하위 폴더 */
export const PHOTO_DIR = "photos";

/**
 * 새 사진 파일의 경로. items.thumbnail 에는 이 상대 경로를 저장한다.
 * iOS 는 앱을 업데이트하면 문서 폴더의 절대 경로가 바뀌므로 절대 주소를 저장하면 안 된다.
 */
export function photoPath(id: string): string {
  return `${PHOTO_DIR}/${id}.jpg`;
}

/**
 * 앱이 문서 폴더에 저장한 사진인지. 아니면(사진 선택기의 임시 주소 등) 앱이 지우지 않는다.
 */
export function isStoredPhoto(thumbnail: string | null | undefined): thumbnail is string {
  return !!thumbnail && thumbnail.startsWith(`${PHOTO_DIR}/`) && !thumbnail.includes("..");
}

/**
 * 화면에 넘길 주소. 저장한 사진은 문서 폴더 주소를 앞에 붙이고, 그 밖의 주소는 그대로 둔다.
 * @param documentUri 문서 폴더 주소 (`file:///…/`). 끝의 `/` 는 있어도 없어도 된다
 */
export function resolvePhotoUri(thumbnail: string, documentUri: string): string {
  if (!isStoredPhoto(thumbnail)) return thumbnail;
  return `${documentUri.replace(/\/+$/, "")}/${thumbnail}`;
}
