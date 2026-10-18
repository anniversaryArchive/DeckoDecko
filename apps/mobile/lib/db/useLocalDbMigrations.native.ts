import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect } from "react";

import migrations from "@/drizzle/migrations";

// "./client" 로 쓰면 타입 검사는 웹 자리표시자를 본다. 네이티브 전용 함수가 있어서 파일을 직접 가리킨다.
import { db, enableForeignKeys } from "./client.native";

/**
 * 앱 시작 시 로컬 DB 마이그레이션을 한 번 돌리고, 끝나면 외래 키 검사를 켠다. 루트 레이아웃에서 호출한다.
 * 실패하면 console.error 로 남긴다.
 * TODO: 아직 로컬 DB 를 쓰는 화면이 없어 렌더 게이팅(완료 전 스플래시 유지 · 실패 화면)은 하지 않는다. 2주차에 결정한다.
 */
export function useLocalDbMigrations() {
  const { success, error } = useMigrations(db, migrations);

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
  }, [success]);

  return { success, error };
}
