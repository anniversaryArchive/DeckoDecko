import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

/**
 * 로컬 DB 연결. 앱 전체에서 이 모듈 싱글턴 하나만 쓴다.
 * 외래 키 검사는 일부러 꺼 둔 채로 연다 (SQLite 기본값). 켜는 것은 마이그레이션이 끝난 뒤 `enableForeignKeys()` 에서.
 */
const expoDb = openDatabaseSync("deckodecko.db");

export const db = drizzle(expoDb, { schema });

/**
 * 마이그레이션이 끝난 뒤 외래 키 검사를 켠다 (items → folders 참조 검사).
 * 마이그레이터는 BEGIN … COMMIT 안에서 돌고, 트랜잭션 안의 `PRAGMA foreign_keys = OFF` 는 무시된다.
 * 켜 둔 채 마이그레이션하면 drizzle-kit 이 테이블을 다시 만들 때(`DROP TABLE`) RESTRICT 에 걸려 롤백된다.
 * 켜기 전에 어긋난 참조가 있으면 개수를 돌려준다 (0 이면 정상).
 */
export function enableForeignKeys(): number {
  const violations = expoDb.getAllSync("PRAGMA foreign_key_check");
  expoDb.execSync("PRAGMA foreign_keys = ON;");
  return violations.length;
}
