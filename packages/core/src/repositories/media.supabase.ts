import type { DeckoSupabaseClient } from "../supabase";
import { toMedia } from "./gacha.supabase.mappers";
import { ANIME_COLUMNS } from "./gacha.supabase.rows";
import type { MediaEntry, MediaRepository } from "./media";

/** 한 요청에 달라고 하는 행 수. 서버의 max_rows 가 더 작으면 그만큼만 오므로, 빈 페이지가 올 때까지 받는다. */
const PAGE_SIZE = 1000;

/** Supabase anime 테이블로 읽는 작품 저장소. 계약은 MediaRepository 와 같다. */
export function createSupabaseMediaRepository(client: DeckoSupabaseClient): MediaRepository {
  return {
    async listMedia() {
      const entries: MediaEntry[] = [];
      for (;;) {
        const from = entries.length;
        const { data, error } = await client
          .from("anime")
          .select(`${ANIME_COLUMNS}, aliases`)
          .order("id")
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw new Error(`[media.listMedia] ${error.message}`, { cause: error });
        if (data.length === 0) return entries;
        entries.push(...data.map((row) => ({ ...toMedia(row), aliases: row.aliases })));
      }
    },
  };
}
