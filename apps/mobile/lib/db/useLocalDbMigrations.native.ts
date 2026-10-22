import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";

import migrations from "@/drizzle/migrations";

// "./client" 로 쓰면 타입 검사는 웹 자리표시자를 본다. 네이티브 전용 함수가 있어서 파일을 직접 가리킨다.
import { db, enableForeignKeys } from "./client.native";

/**
 * 앱 시작 시 로컬 DB 마이그레이션을 한 번 돌리고, 끝나면 외래 키 검사를 켠다. 루트 레이아웃에서 호출하고, 끝날 때까지 화면을 띄우지 않는다.
 * success 는 외래 키를 켠 뒤에 true 가 된다 (마이그레이션 직후에 화면을 띄우면 자식 effect 의 쿼리가 외래 키를 켜기 전에 돈다).
 * 실패하면 console.error 로 남긴다. TODO: 실패 화면은 아직 없다.
 */
export function useLocalDbMigrations() {
  const { success, error } = useMigrations(db, migrations);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) {
      console.error("[local-db] migration failed", error);
    }
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const violations = enableForeignKeys();
    if (violations > 0) {
      console.error(`[local-db] ${violations} foreign key violation(s) after migration`);
    }
    setReady(true);
  }, [success]);

  return { success: ready, error };
}
