import type { KeyValueStorage } from "./repositories/recent.storage";
import { storageKeys } from "./storageKeys";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 익명 기기 UUID 를 꺼내는 함수를 만든다 (조회 로그). 처음 부를 때 키-값 저장소에서 읽고, 없거나 UUID 가 아니면
 * newId 로 만들어 저장한다. 앱은 AsyncStorage 와 expo-crypto 의 randomUUID 를 넘긴다.
 * 한 번 읽은 값은 기억하고, 동시에 불러도 하나만 만든다. 읽기 · 쓰기가 실패하면 던지고 다음 호출에서 다시 시도한다.
 */
export function createStorageDeviceId(
  storage: KeyValueStorage,
  newId: () => string
): () => Promise<string> {
  let pending: Promise<string> | null = null;

  async function load(): Promise<string> {
    const stored = await storage.getItem(storageKeys.deviceId);
    if (stored && UUID.test(stored)) return stored;
    const id = newId();
    await storage.setItem(storageKeys.deviceId, id);
    return id;
  }

  return () => {
    pending ??= load().catch((error: unknown) => {
      pending = null;
      throw error;
    });
    return pending;
  };
}
