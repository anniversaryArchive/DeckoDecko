import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect } from "react";

import migrations from "@/drizzle/migrations";

import { db } from "./client";

/**
 * 앱 시작 시 로컬 DB 마이그레이션을 한 번 돌린다. 루트 레이아웃에서 호출한다.
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

  return { success, error };
}
