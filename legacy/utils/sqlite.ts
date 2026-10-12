import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

class CommonTableInstance {
  #DATABASE_NAME = "test.db";

  createDBInstance = async (): Promise<SQLite.SQLiteDatabase | null> => {
    // expo-sqlite 는 웹에서 지원되지 않기때문에, 플랫폼이 웹인 경우 아무 동작을 하지 않도록 설정
    if (Platform.OS === "web") {
      return null;
    }

    // DB연결
    const dbInstance = await SQLite.openDatabaseAsync(this.#DATABASE_NAME);

    // 기본적으로 SQLite에서 외래 키 제약 조건이 비활성화되어 있기때문에 활성화 설정
    await dbInstance.runAsync("PRAGMA foreign_keys = ON;");

    return dbInstance;
  };
}

export default new CommonTableInstance();
