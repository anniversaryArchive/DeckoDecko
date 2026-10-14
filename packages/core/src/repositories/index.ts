import type { GachaRepository } from "./gacha";

/**
 * 화면이 쓰는 저장소 묶음. CoreProvider 에 통째로 넘긴다.
 * 새 도메인은 ./<도메인>.ts 에 인터페이스를 만들고 여기에 키 하나를 추가한다 (예: notice, feedback).
 */
export type Repositories = {
  gacha: GachaRepository;
};
