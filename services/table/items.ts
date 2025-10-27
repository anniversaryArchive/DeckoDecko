import * as SQLite from "expo-sqlite";

import CommonTabledbInstance from "@/utils/sqlite";
import { TCreateItemDTO, TItem, TUpdateItemDTO } from "@/types/item";
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

  async create({
    name,
    gacha_id,
    folder_id,
    type,
    thumbnail,
    memo,
  }: TCreateItemDTO): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      const result = await db.runAsync(
        "INSERT OR IGNORE INTO items (gacha_id, folder_id, type, name, thumbnail, memo) VALUES (?, ?, ?, ?, ?, ?)",
        gacha_id,
        folder_id,
        type,
        name,
        thumbnail,
        memo
      );

      return !!result.changes;
    } catch (error) {
      console.error("TbItems create Error : ", error);
      return false;
    }
  }

  async getAllByFolderId(folder_id: TFolder["id"]): Promise<TItem[]> {
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
      if (!!fields.length) {
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
}

export default new TbItems();
