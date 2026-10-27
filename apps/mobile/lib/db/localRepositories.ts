import {
  cleanName,
  normalizeName,
  type Folder,
  type Item,
  type ListItemsParams,
  type LocalRepositories,
} from "@deckodecko/core";
import { and, asc, count, desc, eq, ne, sql, type SQL } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import { folders, items } from "./schema";
import type * as schema from "./schema";

// 앱은 expo-sqlite, 테스트는 sql.js 드라이버로 같은 구현을 돌린다. 둘 다 동기 드라이버다.
type LocalDb = BaseSQLiteDatabase<"sync", unknown, typeof schema>;

const now = () => new Date().toISOString();

function itemFilter({ gachaId, type, folderId }: ListItemsParams = {}): SQL | undefined {
  return and(
    gachaId === undefined ? undefined : eq(items.gachaId, gachaId),
    type === undefined ? undefined : eq(items.type, type),
    folderId === undefined ? undefined : eq(items.folderId, folderId)
  );
}

/**
 * 로컬 DB(drizzle) 위의 items · folders 저장소. lib/repositories 에서 db 와 UUID 생성기를 넣어 만든다.
 * 기본 폴더 보호 · 폴더 삭제 시 기록 이동은 DB 트리거(drizzle/0001_*.sql)가 하고, 여기서는 다시 구현하지 않는다.
 */
export function createLocalRepositories(db: LocalDb, newId: () => string): LocalRepositories {
  async function getItem(id: string): Promise<Item | null> {
    const [row] = await db.select().from(items).where(eq(items.id, id));
    return row ?? null;
  }

  async function getFolder(id: string): Promise<Folder | null> {
    const [row] = await db.select().from(folders).where(eq(folders.id, id));
    return row ?? null;
  }

  return {
    items: {
      async listItems(params) {
        return (
          db
            .select()
            .from(items)
            .where(itemFilter(params))
            // created_at 이 같은 밀리초면 나중에 넣은 행(rowid 가 큰 쪽)이 앞
            .orderBy(desc(items.createdAt), desc(sql`rowid`))
        );
      },

      getItem,

      async countItems(params) {
        const rows = await db
          .select({ type: items.type, n: count() })
          .from(items)
          .where(itemFilter({ gachaId: params?.gachaId }))
          .groupBy(items.type);
        const of = (type: Item["type"]) => rows.find((r) => r.type === type)?.n ?? 0;
        return { wish: of("WISH"), get: of("GET") };
      },

      async countItemsByFolder() {
        const rows = await db
          .select({ folderId: items.folderId, n: count() })
          .from(items)
          .groupBy(items.folderId);
        return Object.fromEntries(rows.map((r) => [r.folderId, r.n]));
      },

      async createItem(input) {
        const at = now();
        const [row] = await db
          .insert(items)
          .values({
            id: newId(),
            gachaId: input.gachaId,
            // 없는 폴더 id 는 외래 키 검사가 막는다
            folderId:
              input.folderId ??
              sql`(SELECT ${folders.id} FROM ${folders} WHERE ${folders.isDefault} = 1)`,
            type: input.type,
            name: cleanName(input.name),
            thumbnail: input.thumbnail ?? null,
            memo: input.memo ?? null,
            createdAt: at,
            updatedAt: at,
          })
          .returning();
        return row!;
      },

      async updateItem(id, input) {
        // drizzle 은 set 의 undefined 값을 건너뛴다 (= 안 바꿈)
        const [row] = await db
          .update(items)
          .set({
            ...input,
            name: input.name === undefined ? undefined : cleanName(input.name),
            updatedAt: now(),
          })
          .where(eq(items.id, id))
          .returning();
        if (!row) throw new Error(`item not found: ${id}`);
        return row;
      },

      // TODO(혜진): 3주차에 사진을 앱 폴더로 옮기면 기록을 지울 때 사진 파일도 같이 지운다
      async deleteItem(id) {
        await db.delete(items).where(eq(items.id, id));
      },

      async isItemNameTaken({ gachaId, name, excludeId }) {
        // normalizeName(NFKC 등)은 SQL 로 못 하므로 가챠 하나의 이름만 꺼내 비교한다
        const rows = await db
          .select({ name: items.name })
          .from(items)
          .where(
            and(
              eq(items.gachaId, gachaId),
              excludeId === undefined ? undefined : ne(items.id, excludeId)
            )
          );
        const target = normalizeName(name);
        return rows.some((r) => normalizeName(r.name) === target);
      },
    },

    folders: {
      async listFolders() {
        return db.select().from(folders).orderBy(asc(folders.sequence), asc(folders.createdAt));
      },

      async createFolder(name) {
        const id = newId();
        // MAX(sequence)+1 을 한 문장으로 계산해 넣는다 (목록 길이로 세면 중복될 수 있다)
        await db.run(sql`
          INSERT INTO ${folders} (${sql.identifier(folders.id.name)}, ${sql.identifier(folders.name.name)}, ${sql.identifier(folders.sequence.name)})
          SELECT ${id}, ${cleanName(name)}, COALESCE(MAX(${folders.sequence}), -1) + 1 FROM ${folders}
        `);
        return (await getFolder(id))!;
      },

      async renameFolder(id, name) {
        // 기본 폴더 조건을 UPDATE 안에 넣어 확인과 수정을 한 문장으로 한다
        const [row] = await db
          .update(folders)
          .set({ name: cleanName(name) })
          .where(and(eq(folders.id, id), eq(folders.isDefault, false)))
          .returning();
        if (row) return row;
        if (await getFolder(id)) throw new Error("The default folder cannot be renamed");
        throw new Error(`folder not found: ${id}`);
      },

      async deleteFolder(id) {
        await db.delete(folders).where(eq(folders.id, id));
      },

      async isFolderNameTaken(name, excludeId) {
        const rows = await db
          .select({ name: folders.name })
          .from(folders)
          .where(excludeId === undefined ? undefined : ne(folders.id, excludeId));
        const target = normalizeName(name);
        return rows.some((r) => normalizeName(r.name) === target);
      },
    },
  };
}
