import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

import type * as schema from "./schema";

/**
 * 웹용 자리표시자. 실제 연결은 `client.native.ts` 에 있고 Metro 가 iOS · Android 에서 그쪽을 고른다.
 * 웹의 expo-sqlite 는 SharedArrayBuffer(COOP/COEP 헤더)가 필요한데 `expo start --web` 의 `/` 응답에는 헤더를 붙일 수 없다.
 * 웹은 출시 대상이 아니므로 sqlite 를 번들에 넣지 않고, 접근하면 원인을 알리는 에러를 던진다.
 */
export const db = new Proxy({} as ExpoSQLiteDatabase<typeof schema>, {
  get() {
    throw new Error("[local-db] not available on web (iOS / Android only)");
  },
});
