import AsyncStorage from "@react-native-async-storage/async-storage";

import { createStorageDeviceId } from "@deckodecko/core";

/**
 * 웹 · 테스트용. expo-crypto 는 vitest 가 불러오지 못해서(react-native 소스를 파싱함) 표준 crypto 를 쓴다.
 * 실제 구현은 `deviceId.native.ts`.
 */
export const getDeviceId = createStorageDeviceId(AsyncStorage, () =>
  globalThis.crypto.randomUUID()
);
