import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_UUID_KEY = "@device_uuid";

/**
 * 디바이스 UUID 생성 및 저장
 * AsyncStorage에 UUID가 없으면 새로 생성하여 저장
 * (추후 구독제를 대비해 DB에 저장되는 데이터와의 싱크를 위하여 UUID는 만들어서 저장하여 사용)
 */
export const getDeviceUuid = async (): Promise<string | null> => {
  try {
    // 기존 UUID 확인
    let deviceUuid = await AsyncStorage.getItem(DEVICE_UUID_KEY);

    // UUID가 없는 경우, 새로 생성
    if (!deviceUuid) {
      deviceUuid = uuid.v4() as string;
      await AsyncStorage.setItem(DEVICE_UUID_KEY, deviceUuid);
    }

    return deviceUuid;
  } catch (error) {
    console.error("❌ 디바이스 UUID 초기화 실패 : ", error);
    // 에러 발생 시 임시 UUID 반환
    return null;
  }
};
