import type { Folder } from "../types";

/** 기기 로컬 폴더. 구현 위치 · 에러 규칙은 ItemRepository 와 같다. */
export interface FolderRepository {
  /** sequence 순. 기본 폴더(sequence 0)가 맨 앞 */
  listFolders(): Promise<Folder[]>;
  /** sequence 는 MAX(sequence)+1 */
  createFolder(name: string): Promise<Folder>;
  /** 기본 폴더 · 없는 id 면 던진다 */
  renameFolder(id: string, name: string): Promise<Folder>;
  /** 폴더의 기록은 지워지지 않고 기본 폴더로 옮겨진다. 기본 폴더면 던지고, 없는 id 면 아무 일도 하지 않는다 */
  deleteFolder(id: string): Promise<void>;
  /**
   * 기본 폴더를 뺀 폴더를 ids 순서로 둔다 (sequence 1 부터). 기본 폴더는 늘 맨 앞이다.
   * ids 가 지금의 일반 폴더 전체와 다르면(빠짐 · 남는 id · 중복 · 기본 폴더) 아무것도 바꾸지 않고 던진다.
   */
  reorderFolders(ids: readonly string[]): Promise<void>;
  /** 비교 기준은 normalizeName */
  isFolderNameTaken(name: string, excludeId?: string): Promise<boolean>;
}

/** reorderFolders 의 ids 가 지금의 일반 폴더(currentIds) 전체를 한 번씩 담았는지. 아니면 던진다. 두 구현이 같이 쓴다. */
export function assertFolderOrder(currentIds: readonly string[], ids: readonly string[]): void {
  const current = new Set(currentIds);
  const unique = new Set(ids);
  if (
    unique.size !== ids.length ||
    unique.size !== current.size ||
    ids.some((id) => !current.has(id))
  ) {
    throw new Error("Folder order must list every non-default folder exactly once");
  }
}
