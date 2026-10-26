export type LocalDbMigrations = {
  /** 마이그레이션과 외래 키 켜기까지 끝남 */
  success: boolean;
  /** 실패하면 채워진다. 루트 레이아웃이 실패 화면을 띄운다 */
  error?: Error;
  /** retry 를 누른 뒤 결과를 기다리는 중 (실패 화면이 스피너를 보인다) */
  retrying: boolean;
  retry: () => void;
};

const ready: LocalDbMigrations = { success: true, retrying: false, retry: () => {} };

/**
 * 웹용. 실제 구현은 `useLocalDbMigrations.native.ts` (client.ts 주석 참고).
 * 웹은 로컬 DB 대신 메모리 저장소(local.ts)를 써서 돌릴 마이그레이션이 없으므로 바로 준비 완료다.
 */
export function useLocalDbMigrations(): LocalDbMigrations {
  return ready;
}
