import type { MediaEntry, MediaRepository } from "./media";

/** 메모리 안의 배열로 동작하는 작품 저장소. 목 데이터 화면, 테스트에 쓴다 (개발용 목 데이터: @deckodecko/core/mocks 의 mockMedia). */
export function createMemoryMediaRepository(seed: readonly MediaEntry[]): MediaRepository {
  return {
    async listMedia() {
      return seed.map((m) => ({ ...m, aliases: m.aliases && [...m.aliases] }));
    },
  };
}
