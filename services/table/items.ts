import * as SQLite from "expo-sqlite";

import { buildSelectQuery, buildDeleteQuery, buildInsertQuery } from "@utils/buildSqliteQuery";

import type { TCreateItemDTO, TItem, TUpdateItemDTO } from "@/types/item";
import type { TFolder } from "@/types/folder";

class TbItems {
  #dbInstance: Promise<SQLite.SQLiteDatabase>;

  constructor() {
    this.#dbInstance = this.init();
  }

  private async init(): Promise<SQLite.SQLiteDatabase> {
    try {
      const db = SQLite.openDatabaseSync('deckodecko.db');

      await db.execAsync(`
          CREATE TABLE IF NOT EXISTS items (
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

      return db;
    } catch (error) {
      console.error("TbItems Init Error : ", error);
      throw error;
    }
  }

  async create(data: TCreateItemDTO): Promise<boolean> {
    try {
      const db = await this.#dbInstance;

      // [translate:gacha_id + folder_id 중복 체크]
      const exists = await db.getFirstAsync(
        "SELECT id FROM items WHERE gacha_id = ? AND folder_id = ?",
        [data.gacha_id, data.folder_id]
      );

      if (exists) {
        console.log("[translate:이미 존재하는 gacha_id:]", data.gacha_id, "[translate:in folder:]", data.folder_id);
        return false;
      }

      // 수정: buildInsertQuery 반환값 분리하여 인자로 넘김
      const [query, ...params] = buildInsertQuery<TCreateItemDTO>("items", data);
      const res = await db.runAsync(query, params);
      return !!res.changes;
    } catch (error) {
      console.error("TbItems create Error : ", error);
      return false;
    }
  }

  async getItemsByFolderId(folder_id: TFolder["id"]): Promise<TItem[]> {
    try {
      const db = await this.#dbInstance;
      return await db.getAllAsync<TItem>(
        buildSelectQuery<TItem>("items", {
          where: { folder_id },
          sort: { orderBy: "created_at", order: "DESC" }
        })
      );
    } catch (error) {
      console.error("TbItems getItemsByFolderId Error : ", error);
      return [];
    }
  }

  async getItemsByGachaId(gacha_id: TItem["gacha_id"]): Promise<TItem[]> {
    try {
      const db = await this.#dbInstance;
      return await db.getAllAsync<TItem>(
        buildSelectQuery<TItem>("items", {
          where: { gacha_id },
          sort: { orderBy: "created_at", order: "DESC" }
        })
      );
    } catch (error) {
      console.error("TbItems getItemsByGachaId Error : ", error);
      return [];
    }
  }

  async getItemByName(name: TItem["name"]): Promise<TItem | null> {
    try {
      const db = await this.#dbInstance;
      return await db.getFirstAsync<TItem>(
        buildSelectQuery<TItem>("items", { where: { name } })
      );
    } catch (error) {
      console.error("TbItems getItemByName Error : ", error);
      return null;
    }
  }

  async getAll(): Promise<TItem[]> {
    try {
      const db = await this.#dbInstance;
      return await db.getAllAsync<TItem>(
        buildSelectQuery<TItem>("items", {
          sort: { orderBy: "created_at", order: "DESC" }
        })
      );
    } catch (error) {
      console.error("TbItems getAll Error : ", error);
      return [];
    }
  }

  async update(id: TItem["id"], updates: TUpdateItemDTO): Promise<boolean> {
    try {
      const db = await this.#dbInstance;

      if (!Object.keys(updates).length) return false;

      const updateData = { ...updates, updated_at: new Date().toISOString() };

      // 수정: buildInsertQuery 반환값 분리하여 인자로 넘김
      const [query, ...params] = buildInsertQuery<TUpdateItemDTO & { updated_at: string }>("items", updateData, { conflict: "UPDATE", where: { id } });
      return (await db.runAsync(query, params)).changes > 0;
    } catch (error) {
      console.error("TbItems update Error : ", error);
      return false;
    }
  }

  async delete(id: TItem["id"]): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      const result = await db.runAsync(
        buildDeleteQuery<TItem>("items", { id })
      );
      return result.changes > 0;
    } catch (error) {
      console.error("TbItems delete Error : ", error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      const res = await db.runAsync("DELETE FROM items;");
      return !!res.changes;
    } catch (error) {
      console.error("TbItems clear Error : ", error);
      return false;
    }
  }

  async migration(): Promise<boolean> {
    try {
      const db = await this.#dbInstance;

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
        INSERT INTO items_new SELECT * FROM items;
      `);

      await db.runAsync(`DROP TABLE items;`);
      const result = await db.runAsync(`ALTER TABLE items_new RENAME TO items;`);

      console.log("[translate:Items migration completed]");
      return !!result.changes;
    } catch (error) {
      console.error("TbItems migration Error:", error);
      return false;
    }
  }
}

export default new TbItems();
