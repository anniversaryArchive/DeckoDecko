import { describe, expect, it, vi } from "vitest";

import { createStorageDeviceId } from "./deviceId";
import { createMemoryKeyValueStorage } from "./repositories/recent.storage";
import { storageKeys } from "./storageKeys";

const A = "8c2f3a1e-4b5d-4e6f-8a9b-0c1d2e3f4a5b";
const B = "1b2c3d4e-5f60-4a7b-8c9d-0e1f2a3b4c5d";

describe("createStorageDeviceId", () => {
  it("처음에는 만들어 저장하고, 다음부터는 같은 값을 쓴다", async () => {
    const storage = createMemoryKeyValueStorage();
    const newId = vi.fn(() => A);
    const getDeviceId = createStorageDeviceId(storage, newId);
    expect(await getDeviceId()).toBe(A);
    expect(await getDeviceId()).toBe(A);
    expect(newId).toHaveBeenCalledOnce();
    expect(storage.snapshot()).toEqual({ [storageKeys.deviceId]: A });
  });

  it("저장된 값이 있으면 그것을 쓴다 (앱을 다시 켜도 같은 기기)", async () => {
    const storage = createMemoryKeyValueStorage({ [storageKeys.deviceId]: A });
    expect(await createStorageDeviceId(storage, () => B)()).toBe(A);
  });

  it("저장된 값이 UUID 가 아니면 새로 만든다", async () => {
    const storage = createMemoryKeyValueStorage({ [storageKeys.deviceId]: "broken" });
    expect(await createStorageDeviceId(storage, () => B)()).toBe(B);
    expect(storage.snapshot()[storageKeys.deviceId]).toBe(B);
  });

  it("동시에 불러도 하나만 만든다", async () => {
    const newId = vi.fn(() => A);
    const getDeviceId = createStorageDeviceId(createMemoryKeyValueStorage(), newId);
    expect(await Promise.all([getDeviceId(), getDeviceId()])).toEqual([A, A]);
    expect(newId).toHaveBeenCalledOnce();
  });

  it("저장에 실패하면 던지고, 다음 호출에서 다시 시도한다", async () => {
    const storage = createMemoryKeyValueStorage();
    const setItem = vi.spyOn(storage, "setItem").mockRejectedValueOnce(new Error("disk full"));
    const getDeviceId = createStorageDeviceId(storage, () => A);
    await expect(getDeviceId()).rejects.toThrow("disk full");
    expect(await getDeviceId()).toBe(A);
    expect(setItem).toHaveBeenCalledTimes(2);
  });
});
