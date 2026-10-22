import type { FolderRepository } from "./folders";
import type { GachaRepository } from "./gacha";
import type { ItemRepository } from "./items";

/** 기기 로컬 기록 저장소. 앱만 넘긴다 (백오피스는 사용자 기기의 기록을 읽지 않는다). */
export type LocalRepositories = {
  items: ItemRepository;
  folders: FolderRepository;
};

/**
 * 화면이 쓰는 저장소 묶음. CoreProvider 에 통째로 넘긴다.
 * 파일 규칙: <도메인>.ts 인터페이스, <도메인>.memory.ts 메모리 구현, <도메인>.supabase.ts Supabase 구현.
 * 새 도메인은 세 파일을 만들고 여기에 키 하나를 추가한다 (예: notice, feedback).
 * 로컬 기록(items · folders)은 메모리 구현이 local.memory.ts 하나이고, 실제 구현은 앱의 lib/db 에 있다.
 */
export type Repositories = {
  gacha: GachaRepository;
} & Partial<LocalRepositories>;
