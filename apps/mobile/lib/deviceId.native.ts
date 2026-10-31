import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";

import { createStorageDeviceId } from "@deckodecko/core";

/**
 * 이 기기의 UUID. 요청 · 문의, 조회 로그처럼 기기를 구분해야 하는 저장소에 이 함수 하나를 넘긴다 (새로 만들지 않는다).
 * 앱을 지우면 새 UUID 가 생긴다. 웹 · 테스트용은 deviceId.ts.
 */
export const getDeviceId = createStorageDeviceId(AsyncStorage, randomUUID);
