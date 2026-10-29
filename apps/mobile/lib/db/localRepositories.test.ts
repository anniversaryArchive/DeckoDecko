/// <reference types="node" />
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import { beforeEach, describe, expect, it } from "vitest";

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

function createRepositories(deletePhoto: (thumbnail: string) => void = () => {}) {
  const sqlite = new SQL.Database();
  for (const statement of migrationStatements) sqlite.run(statement);
  // 앱도 마이그레이션 뒤에 켠다 (client.native.ts 의 enableForeignKeys)
  sqlite.run("PRAGMA foreign_keys = ON;");
  return createLocalRepositories(drizzle(sqlite, { schema }), randomUUID, deletePhoto);
}

describeLocalRepositories("createLocalRepositories (sql.js)", () => createRepositories());

describe("사진 파일 정리", () => {
  let deleted: string[];
  let repos: ReturnType<typeof createRepositories>;

  beforeEach(() => {
    deleted = [];
    repos = createRepositories((thumbnail) => deleted.push(thumbnail));
  });

  const create = (thumbnail: string | null) =>
    repos.items.createItem({ gachaId: "g1", type: "WISH", name: "토끼", thumbnail });

  it("기록을 지우면 그 사진을 지운다", async () => {
    const item = await create("photos/a.jpg");
    await repos.items.deleteItem(item.id);
    expect(deleted).toEqual(["photos/a.jpg"]);
  });

  it("사진 없는 기록 · 없는 기록을 지우면 아무것도 지우지 않는다", async () => {
    const item = await create(null);
    await repos.items.deleteItem(item.id);
    await repos.items.deleteItem("missing");
    expect(deleted).toEqual([]);
  });

  it("사진을 바꾸면 예전 사진을 지운다", async () => {
    const item = await create("photos/a.jpg");
    await repos.items.updateItem(item.id, { thumbnail: "photos/b.jpg" });
    expect(deleted).toEqual(["photos/a.jpg"]);
  });

  it("사진을 빼면 예전 사진을 지운다", async () => {
    const item = await create("photos/a.jpg");
    await repos.items.updateItem(item.id, { thumbnail: null });
    expect(deleted).toEqual(["photos/a.jpg"]);
  });

  it("같은 사진으로 저장하거나 사진을 건드리지 않으면 지우지 않는다", async () => {
    const item = await create("photos/a.jpg");
    await repos.items.updateItem(item.id, { thumbnail: "photos/a.jpg", name: "곰" });
    await repos.items.updateItem(item.id, { type: "GET" });
    expect(deleted).toEqual([]);
  });

  it("폴더를 지워도 기록이 기본 폴더로 옮겨지므로 사진을 지우지 않는다", async () => {
    const folder = await repos.folders.createFolder("상자");
    await repos.items.createItem({
      gachaId: "g1",
      type: "WISH",
      name: "토끼",
      folderId: folder.id,
      thumbnail: "photos/a.jpg",
    });
    await repos.folders.deleteFolder(folder.id);
    expect(deleted).toEqual([]);
  });
});
