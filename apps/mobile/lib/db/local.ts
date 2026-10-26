import { createMemoryLocalRepositories } from "@deckodecko/core";

/**
 * 웹용. 로컬 DB 가 없으므로(client.ts 참고) 메모리 저장소로 대신한다. 새로고침하면 기록이 사라진다.
 * 실제 구현은 `local.native.ts`.
 */
export const localRepositories = createMemoryLocalRepositories();
