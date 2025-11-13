import * as SQLite from "expo-sqlite";

import CommonTabledbInstance from "@/utils/sqlite";
import { buildInsertQuery } from "@utils/buildSqliteQuery";

import type { TCreateItemDTO, TItem, TUpdateItemDTO } from "@/types/item";
import type { TFolder } from "@/types/folder";

class TbItems {
  #dbInstance: Promise<SQLite.SQLiteDatabase | null>;

  constructor() {
    this.#dbInstance = this.init();
  }

  private async init(): Promise<SQLite.SQLiteDatabase | null> {
    try {
      const inst = await CommonTabledbInstance.createDBInstance();

      if (inst) {
        await inst.runAsync(` 
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folder_id INTEGER NOT NULL,
                gacha_id INTEGER UNIQUE NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('WISH', 'GET')),
                name TEXT NOT NULL,
                thumbnail TEXT,
                memo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE
            );
        `);
      }

      return inst;
    } catch (error) {
      console.error("TbItems Init Error : ", error);
      return null;
    }
  }

  async create(data: TCreateItemDTO): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      const res = await db.runAsync(...buildInsertQuery<TCreateItemDTO>("items", data));

      return !!res.changes;
    } catch (error) {
      console.error("TbItems create Error : ", error);
      return false;
    }
  }

  async getItemsByFolderId(folder_id: TFolder["id"]): Promise<TItem[]> {
    try {
      const db = await this.#dbInstance;
      if (!db) return [];

      const itemList = (await db.getAllAsync(
        "SELECT * FROM items WHERE folder_id = ? ORDER BY created_at DESC;",
        [folder_id]
      )) as TItem[];

      return itemList;
    } catch (error) {
      console.error("TbItems getItemsByFolderId Error : ", error);

      return [];
    }
  }

  async getItemsByGachaId(gacha_id: TItem["gacha_id"]): Promise<TItem[]> {
    try {
      const db = await this.#dbInstance;
      if (!db) return [];

      const itemList = (await db.getAllAsync(
        "SELECT * FROM items WHERE gacha_id = ? ORDER BY created_at DESC;",
        [gacha_id]
      )) as TItem[];

      return itemList;
    } catch (error) {
      console.error("TbItems getItemsByGachaId Error : ", error);

      return [];
    }
  }

  async getItemByName(name: TItem["name"]): Promise<TItem | null> {
    try {
      const db = await this.#dbInstance;
      if (!db) return null;

      const firstRow: TItem | null = await db.getFirstAsync(
        "SELECT * FROM items WHERE name = ?;",
        name
      );

      return firstRow;
    } catch (error) {
      console.error("TbItems getItemByName Error : ", error);

      return null;
    }
  }

  async getAll(): Promise<TItem[]> {
    try {
      const db = await this.#dbInstance;
      if (!db) return [];

      const itemList = (await db.getAllAsync(
        "SELECT * FROM items ORDER BY created_at DESC;"
      )) as TItem[];

      return itemList;
    } catch (error) {
      console.error("TbItems getAllItems Error : ", error);
      return [];
    }
  }

  async update(id: TItem["id"], updates: TUpdateItemDTO) {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      const fields = Object.keys(updates);
      const values = Object.values(updates);

      // 업데이트할 내용이 없으면 종료
      if (!fields.length) {
        return false;
      }

      fields.push("updated_at");
      values.push(new Date().toDateString());

      // "name = ?, memo = ?, updated_at = ?" 형태의 SQL SET 구문 생성
      const setClause = fields.map((field) => `${field} = ?`).join(", ");

      const result = await db.runAsync(`UPDATE items SET ${setClause} WHERE id = ?`, [
        ...values,
        id,
      ]);

      return !!result.changes;
    } catch (error) {
      console.error("TbItems update Error : ", error);
      return false;
    }
  }

  async clear() {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      const res = await db.runAsync("DELETE FROM items;");
      return !!res.changes;
    } catch (error) {
      console.error("테이블 마이그레이션 실패:", error);

      return false;
    }
  }

  async migration() {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      await db.runAsync(`
          CREATE TABLE items_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              folder_id INTEGER NOT NULL,
              gacha_id INTEGER NOT NULL,
              type TEXT NOT NULL CHECK(type IN ('WISH', 'GET')),
              name TEXT NOT NULL,
              thumbnail TEXT,
              memo TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
              FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE
          );
      `);

      await db.runAsync(`
        INSERT INTO items_new (id, folder_id, gacha_id, type, name, thumbnail, memo, created_at, updated_at)
        SELECT id, folder_id, gacha_id, type, name, thumbnail, memo, created_at, updated_at
        FROM items;`);

      await db.runAsync(`DROP TABLE items;`);
      const result = await db.runAsync(`ALTER TABLE items_new RENAME TO items;`);

      return !!result.changes;
    } catch (error) {
      console.error("테이블 마이그레이션 실패:", error);

      return false;
    }
  }
}

export default new TbItems();
