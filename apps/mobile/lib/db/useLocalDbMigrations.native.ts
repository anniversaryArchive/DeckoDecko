import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { useCallback, useEffect, useState } from "react";

import migrations from "@/drizzle/migrations";

// "./client" 로 쓰면 타입 검사는 웹 자리표시자를 본다. 네이티브 전용 함수가 있어서 파일을 직접 가리킨다.
import { db, enableForeignKeys } from "./client.native";
import type { LocalDbMigrations } from "./useLocalDbMigrations";

/**
 * 앱 시작 시 로컬 DB 마이그레이션을 돌리고, 끝나면 외래 키 검사를 켠다. 루트 레이아웃에서 호출하고, 끝날 때까지 화면을 띄우지 않는다.
 * success 는 외래 키를 켠 뒤에 true 가 된다 (마이그레이션 직후에 화면을 띄우면 자식 effect 의 쿼리가 외래 키를 켜기 전에 돈다).
 * 실패하면 error 를 채우고, retry 로 다시 돌린다. 마이그레이션은 트랜잭션 안에서 돌아서 실패하면 통째로 롤백된다.
 * drizzle 의 useMigrations 는 마운트 때 한 번만 돌아서 다시 시도할 수 없으므로 migrate 를 직접 부른다.
 */
export function useLocalDbMigrations(): LocalDbMigrations {
  const [state, setState] = useState<Omit<LocalDbMigrations, "retry">>({
    success: false,
    retrying: false,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    migrate(db, migrations)
      .then(() => {
        const violations = enableForeignKeys();
        if (violations > 0) {
          console.error(`[local-db] ${violations} foreign key violation(s) after migration`);
        }
        setState({ success: true, retrying: false });
      })
      .catch((error: unknown) => {
        console.error("[local-db] migration failed", error);
        setState({
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          retrying: false,
        });
      });
  }, [attempt]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, retrying: true }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
