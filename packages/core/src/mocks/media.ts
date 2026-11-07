import { mockCatalog } from "./catalog";
import type { MediaEntry } from "../repositories/media";

const aliases: Record<string, string[]> = {
  "m-starry-forest": ["별숲", "ほしもり"],
  "m-cat-cafe": ["냥카페"],
};

/** 개발용 목 작품 목록 (작품 자동완성). 목 카탈로그에 나오는 작품에 검색용 별칭을 붙였다. */
export const mockMedia: MediaEntry[] = [
  ...new Map(
    mockCatalog.flatMap((g) => (g.media ? [[g.media.id, g.media] as const] : []))
  ).values(),
].map((m) => ({ ...m, aliases: aliases[m.id] ?? [] }));
