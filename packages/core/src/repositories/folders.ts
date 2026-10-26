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
  /** 비교 기준은 normalizeName */
  isFolderNameTaken(name: string, excludeId?: string): Promise<boolean>;
}
