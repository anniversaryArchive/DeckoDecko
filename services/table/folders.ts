import * as SQLite from "expo-sqlite";

import CommonTabledbInstance from "@/utils/sqlite";
import type { TFolder } from "@/types/folder";

class TbFolders {
  #dbInstance: Promise<SQLite.SQLiteDatabase | null>;

  constructor() {
    this.#dbInstance = this.init();
  }

  private async init(): Promise<SQLite.SQLiteDatabase | null> {
    try {
      const inst = await CommonTabledbInstance.createDBInstance();

      if (inst) {
        await inst.runAsync(`
           CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            sequence INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );`);

        const firstRow = await inst.getFirstAsync("SELECT * FROM folders");

        if (firstRow === null) {
          await inst.runAsync("INSERT INTO folders (name, sequence) VALUES (?, ?)", "기본 폴더", 1);
        }
      }

      return inst;
    } catch (error) {
      console.error("TbFolders Init Error : ", error);
      return null;
    }
  }

  async create(name: string, sequence: number): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      const result = await db.runAsync(
        "INSERT INTO folders (name, sequence) VALUES (?, ?)",
        name,
        sequence
      );

      return !!result.changes;
    } catch (error) {
      console.error("TbFolders create Error : ", error);
      return false;
    }
  }

  async getAll(): Promise<TFolder[]> {
    const db = await this.#dbInstance;
    if (!db) return [];

    try {
      return await db.getAllAsync<TFolder>("SELECT * FROM folders ORDER BY sequence");
    } catch (error) {
      console.error("TbFolders getAll Error : ", error);
      return [];
    }
  }

  async getFolderById(id: TFolder["id"]): Promise<TFolder | null> {
    const db = await this.#dbInstance;
    if (!db) return null;

    try {
      return await db.getFirstAsync<TFolder>("SELECT * FROM folders WHERE id = ?", id);
    } catch (error) {
      console.error("TbFolders getOne Error : ", error);
      return null;
    }
  }

  async update(id: number, newname: string): Promise<boolean> {
    const db = await this.#dbInstance;
    if (!db) return false;

    try {
      const result = await db.runAsync("UPDATE folders SET name = ? WHERE id = ?", newname, id);
      return result.changes > 0;
    } catch (error) {
      console.error(`TbFolders update ${id} Error : ${error}`);
      return false;
    }
  }

  async updateSequence(newFolderList: TFolder[]): Promise<boolean> {
    const db = await this.#dbInstance;
    if (!db) return false;

    try {
      await db.withTransactionAsync(async () => {
        for (const folder of newFolderList) {
          await db.runAsync("UPDATE folders SET sequence = ? WHERE id = ?;", [
            folder.sequence,
            folder.id,
          ]);
        }
      });

      return true;
    } catch (error) {
      console.error(`TbFolders update sequence Error : ${error}`);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    const db = await this.#dbInstance;
    if (!db) return false;

    try {
      const result = await db.runAsync("DELETE FROM folders WHERE id = ?", id);
      return result.changes > 0;
    } catch (error) {
      console.error(`TbFolders delete ${id} Error : ${error}`);
      return false;
    }
  }

  // 개발테스트 용
  async clear(): Promise<number | boolean> {
    const db = await this.#dbInstance;
    if (!db) return false;

    try {
      await db.execAsync(`
        DROP TABLE folders;
        UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'folders';`);

      return true;
    } catch (error) {
      console.error(`TbFolders clear Error : ${error}`);
      return false;
    }
  }
}

export default new TbFolders();
