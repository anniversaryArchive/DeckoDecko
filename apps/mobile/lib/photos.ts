/**
 * 웹용. 웹은 기록을 메모리에만 두므로(lib/db/local.ts) 사진도 복사하지 않고 고른 주소를 그대로 쓴다.
 * 실제 구현은 `photos.native.ts`.
 */
export async function savePhoto(sourceUri: string): Promise<string> {
  return sourceUri;
}

export function deletePhoto(_thumbnail: string | null | undefined): void {}

export function photoUri(thumbnail: string): string {
  return thumbnail;
}
