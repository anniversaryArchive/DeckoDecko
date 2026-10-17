/**
 * 웹용 자리표시자. 실제 구현은 `useLocalDbMigrations.native.ts` (client.ts 주석 참고).
 * 웹에서는 마이그레이션을 돌리지 않고, 네이티브 훅과 같은 모양으로 실패를 돌려준다.
 */
const unsupportedOnWeb = new Error("[local-db] not available on web (iOS / Android only)");

export function useLocalDbMigrations(): { success: boolean; error?: Error } {
  return { success: false, error: unsupportedOnWeb };
}
