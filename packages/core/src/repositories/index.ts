import type { GachaRepository } from "./gacha";

/**
 * 화면이 쓰는 저장소 묶음. CoreProvider 에 통째로 넘긴다.
 * 파일 규칙: <도메인>.ts 인터페이스, <도메인>.memory.ts 메모리 구현, <도메인>.supabase.ts Supabase 구현.
 * 새 도메인은 세 파일을 만들고 여기에 키 하나를 추가한다 (예: notice, feedback).
 */
export type Repositories = {
  gacha: GachaRepository;
};
