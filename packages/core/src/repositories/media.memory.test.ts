import { describe, expect, it } from "vitest";

import type { MediaEntry } from "./media";
import { createMemoryMediaRepository } from "./media.memory";

const seed: MediaEntry[] = [
  { id: "m-1", title: "별의 숲", titleJa: null, titleEn: null, kind: null, aliases: ["별숲"] },
  { id: "m-2", title: "고양이 카페", titleJa: null, titleEn: null, kind: null },
];

describe("createMemoryMediaRepository", () => {
  it("받은 순서대로 별칭까지 돌려준다", async () => {
    expect(await createMemoryMediaRepository(seed).listMedia()).toEqual(seed);
  });

  it("돌려준 목록을 고쳐도 저장소의 데이터는 바뀌지 않는다", async () => {
    const repo = createMemoryMediaRepository(seed);
    const [first] = await repo.listMedia();
    first!.title = "바뀜";
    (first!.aliases as string[]).push("바뀜");
    expect((await repo.listMedia())[0]).toMatchObject({ title: "별의 숲", aliases: ["별숲"] });
  });
});
