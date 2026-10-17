import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

/**
 * 로컬 DB 연결. 앱 전체에서 이 모듈 싱글턴 하나만 쓴다.
 * SQLite 는 연결마다 외래 키 검사가 꺼져 있으므로 연결 직후 켠다 (items → folders 참조 검사용).
 */
const expoDb = openDatabaseSync("deckodecko.db");
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { schema });
