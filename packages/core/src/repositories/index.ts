import type { FolderRepository } from "./folders";
import type { GachaRepository } from "./gacha";
import type { ItemRepository } from "./items";
import type { NoticeRepository } from "./notice";
import type { RecentRepository } from "./recent";

/** 기기 로컬 기록 저장소. 앱만 넘긴다 (백오피스는 사용자 기기의 기록을 읽지 않는다). */
export type LocalRepositories = {
  items: ItemRepository;
  folders: FolderRepository;
};

/**
 * CoreProvider 에 빠져 있어도 되는 저장소. 빠지면 그 도메인의 훅은 요청하지 않고 데이터 없음으로 끝난다.
 * 공지가 빠지면 앱은 공지 띠를 숨기고 공지 목록은 빈 상태가 된다. 백오피스는 공지를 넘기지 않는다.
 */
export type OptionalRepositories = {
  notice: NoticeRepository;
};

/**
 * 화면이 쓰는 저장소 묶음. CoreProvider 에 통째로 넘긴다.
 * 파일 규칙: <도메인>.ts 인터페이스, <도메인>.memory.ts 메모리 구현, <도메인>.supabase.ts Supabase 구현.
 * 새 도메인은 세 파일을 만들고 여기에 키 하나를 추가한다 (예: notice, feedback).
 * 로컬 기록(items · folders)은 메모리 구현이 local.memory.ts 하나이고, 실제 구현은 앱의 lib/db 에 있다.
 */
export type Repositories = {
  gacha: GachaRepository;
  /**
   * 최근 검색어 · 최근 본 가챠 (기기 키-값 저장소, recent.storage.ts). 앱만 넘긴다.
   * 백오피스는 사용자 기기의 기록을 쓰지 않으므로 선택으로 둔다. 넘기지 않고 최근 기록 훅을 쓰면 훅이 던진다.
   */
  recent?: RecentRepository;
} & Partial<LocalRepositories> &
  Partial<OptionalRepositories>;
