import type { GachaRepository } from "./gacha";
import type { RecentRepository } from "./recent";

/**
 * 화면이 쓰는 저장소 묶음. CoreProvider 에 통째로 넘긴다.
 * 파일 규칙: <도메인>.ts 인터페이스, <도메인>.memory.ts 메모리 구현, <도메인>.supabase.ts Supabase 구현.
 * 새 도메인은 세 파일을 만들고 여기에 키 하나를 추가한다 (예: notice, feedback).
 */
export type Repositories = {
  gacha: GachaRepository;
  /**
   * 최근 검색어 · 최근 본 가챠 (기기 키-값 저장소, recent.storage.ts). 앱만 넘긴다.
   * 백오피스는 사용자 기기의 기록을 쓰지 않으므로 선택으로 둔다. 넘기지 않고 최근 기록 훅을 쓰면 훅이 던진다.
   */
  recent?: RecentRepository;
};
