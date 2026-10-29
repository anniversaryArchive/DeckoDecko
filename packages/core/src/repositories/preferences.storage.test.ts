import { describe, expect, it } from "vitest";

import { storageKeys } from "../storageKeys";
import { createStoragePreferencesRepository } from "./preferences.storage";
import { createMemoryKeyValueStorage } from "./recent.storage";

describe("createStoragePreferencesRepository", () => {
  it("저장된 값이 없으면 풀어보기", async () => {
    const repo = createStoragePreferencesRepository(createMemoryKeyValueStorage());
    expect(await repo.getGoodsViewMode()).toBe("items");
  });

  it("고른 방식을 저장하고 다시 읽는다", async () => {
    const storage = createMemoryKeyValueStorage();
    const repo = createStoragePreferencesRepository(storage);
    expect(await repo.setGoodsViewMode("gachas")).toBe("gachas");
    expect(await repo.getGoodsViewMode()).toBe("gachas");
    expect(storage.snapshot()).toEqual({ [storageKeys.goodsViewMode]: "gachas" });
  });

  it("모르는 값이 저장돼 있으면 풀어보기", async () => {
    const repo = createStoragePreferencesRepository(
      createMemoryKeyValueStorage({ [storageKeys.goodsViewMode]: "grid" })
    );
    expect(await repo.getGoodsViewMode()).toBe("items");
  });
});
