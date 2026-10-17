import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 기기 로컬 DB 스키마 (expo-sqlite).
 * - id 는 text UUID. 시각은 ISO 8601 UTC 텍스트.
 * - 스키마를 바꾸면 `pnpm --filter @deckodecko/mobile db:generate` 로 drizzle/ 에 마이그레이션을 만든다.
 * - 기본 폴더 행과 삭제 방지 트리거는 커스텀 마이그레이션(drizzle/0001_*.sql)에 있다.
 */

/** 기본값: 현재 시각 ISO 8601 (밀리초, UTC) */
const isoNow = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

export const folders = sqliteTable(
  "folders",
  {
    id: text("id").primaryKey(),
    // 폴더 정렬 순서
    sequence: integer("sequence").notNull(),
    name: text("name").notNull(),
    // 기본 폴더 여부. 표시 이름은 화면에서 i18n 키로 정한다.
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (t) => [
    // 기본 폴더는 최대 하나
    uniqueIndex("folders_single_default_idx")
      .on(t.isDefault)
      .where(sql`${t.isDefault} = 1`),
  ]
);

export const items = sqliteTable(
  "items",
  {
    id: text("id").primaryKey(),
    folderId: text("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    // 가챠 하나에 아이템 여러 개가 가능하므로 UNIQUE 를 걸지 않는다.
    gachaId: text("gacha_id").notNull(),
    type: text("type", { enum: ["WISH", "GET"] }).notNull(),
    // 이름 중복은 앱에서 검사한다 (DB 제약 없음).
    name: text("name").notNull(),
    thumbnail: text("thumbnail"),
    memo: text("memo"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (t) => [
    index("items_folder_id_idx").on(t.folderId),
    index("items_gacha_id_idx").on(t.gachaId),
    check("items_type_check", sql`${t.type} IN ('WISH', 'GET')`),
  ]
);
