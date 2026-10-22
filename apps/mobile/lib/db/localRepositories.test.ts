/// <reference types="node" />
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";

import { describeLocalRepositories } from "@deckodecko/core/testing";

import { createLocalRepositories } from "./localRepositories";
import * as schema from "./schema";

// 앱과 같은 마이그레이션 SQL(트리거 포함)을 sql.js 에 적용해, 저장소와 DB 제약을 함께 검사한다.
const drizzleDir = join(import.meta.dirname, "../../drizzle");
const journal = JSON.parse(readFileSync(join(drizzleDir, "meta/_journal.json"), "utf8")) as {
  entries: { tag: string }[];
};
const migrationStatements = journal.entries.flatMap(({ tag }) =>
  readFileSync(join(drizzleDir, `${tag}.sql`), "utf8").split("--> statement-breakpoint")
);
const SQL = await initSqlJs();

describeLocalRepositories("createLocalRepositories (sql.js)", () => {
  const sqlite = new SQL.Database();
  for (const statement of migrationStatements) sqlite.run(statement);
  // 앱도 마이그레이션 뒤에 켠다 (client.native.ts 의 enableForeignKeys)
  sqlite.run("PRAGMA foreign_keys = ON;");
  return createLocalRepositories(drizzle(sqlite, { schema }), randomUUID);
});
